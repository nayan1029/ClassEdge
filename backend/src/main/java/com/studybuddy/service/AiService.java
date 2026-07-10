package com.studybuddy.service;

import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.studybuddy.dto.AssistantRequest;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AiService {

    private static final String CHAT_SYSTEM_PROMPT = """
        You are StudyBuddy, an AI assistant for college students that behaves like a
        capable general-purpose chatbot (comparable to ChatGPT or Gemini) — not a
        hint-only tutor. When asked a problem, actually solve it completely: show
        full step-by-step math/logic solutions with the final answer, and write real,
        runnable code for coding questions.
        Use the conversation history and connect follow-ups to the earlier topic.
        Respond in valid JSON only with the keys answer and nextSteps.
        answer must be a string. It may contain Markdown (headings, bold, code fences).
        nextSteps must be an array of up to 3 short strings.
        """;

    // Used only for streaming: no JSON instruction, because partial JSON can't be
    // rendered token-by-token the way plain prose can.
    private static final String CHAT_SYSTEM_PROMPT_STREAM = """
        You are StudyBuddy, an AI assistant for college students that behaves like a
        capable general-purpose chatbot (comparable to ChatGPT or Gemini) — not a
        hint-only tutor. When asked a problem, actually solve it completely.

        Rules:
        - For math, logic, or algorithm problems: show the full step-by-step solution
          and give the final answer clearly, don't just describe the method.
        - For coding questions: write real, runnable code in fenced Markdown code
          blocks with the correct language tag (```python, ```java, ```javascript, etc.),
          and briefly explain how it works.
        - For conceptual questions: give a direct, complete explanation with a concrete
          example, not just a pointer toward one.
        - Use Markdown formatting naturally: headings, bold, bullet points, and code
          fences where they genuinely help readability.
        - Use the conversation history to stay on topic and handle follow-ups naturally.
        - Be direct and confident. Don't pad answers with disclaimers or with vague
          "next step" suggestions unless the user actually asked what to do next.
        """;

    private final ObjectMapper objectMapper;
    private final HttpClient httpClient = HttpClient.newBuilder()
        .connectTimeout(Duration.ofSeconds(20))
        .build();

    @Value("${ai.provider:auto}")
    private String aiProvider;

    @Value("${ai.openai.api-key:}")
    private String openAiApiKey;

    @Value("${ai.openai.model:gpt-4o-mini}")
    private String openAiModel;

    @Value("${ai.gemini.api-key:}")
    private String geminiApiKey;

    // gemini-1.5-flash was fully shut down by Google (404s on every call) — using
    // the "-latest" alias instead of a pinned version so this keeps working as
    // Google rotates the underlying model rather than silently breaking again.
    @Value("${ai.gemini.model:gemini-flash-latest}")
    private String geminiModel;

    public Map<String, Object> summarize(String text) {
        String cleanText = normalize(text);
        List<String> sentences = splitSentences(cleanText);
        String summary = sentences.stream()
                .limit(3)
                .collect(Collectors.joining(" "));

        if (summary.isBlank()) {
            summary = "Add notes to generate a focused summary.";
        }

        return Map.of(
                "summary", summary,
                "keyPoints", sentences.stream().limit(5).toList(),
                "provider", "local-ai-fallback"
        );
    }

    public Map<String, Object> generateQuiz(String topic, String difficulty) {
        String safeTopic = normalize(topic);
        if (safeTopic.isBlank()) {
            safeTopic = "the selected topic";
        }
        String level = normalize(difficulty);
        if (level.isBlank()) {
            level = "medium";
        }

        return Map.of(
                "topic", safeTopic,
                "difficulty", level,
                "questions", List.of(
                        Map.of(
                                "type", "MCQ",
                                "question", "Which statement best describes " + safeTopic + "?",
                                "options", List.of("A core concept to understand", "Only a memorization trick", "A database password", "A deployment server"),
                                "answer", "A core concept to understand"
                        ),
                        Map.of(
                                "type", "Short",
                                "question", "Explain one real-world use case of " + safeTopic + ".",
                                "answer", "Connect the concept to a practical student project or exam scenario."
                        ),
                        Map.of(
                                "type", "MCQ",
                                "question", "For " + level + " practice, what should you do after learning " + safeTopic + "?",
                                "options", List.of("Solve examples", "Skip revision", "Ignore mistakes", "Delete notes"),
                                "answer", "Solve examples"
                        )
                )
        );
    }

    public Map<String, Object> analyzeResume(String content) {
        String resume = normalize(content);
        int score = Math.min(95, Math.max(60, resume.length() / 20));
        List<String> suggestions = new ArrayList<>();
        suggestions.add("Use quantified impact statements for projects and internships.");
        suggestions.add("Add role-specific keywords from the target job description.");
        suggestions.add("Keep the summary concise and focused on strengths.");
        if (!resume.toLowerCase().contains("github")) {
            suggestions.add("Include a GitHub or portfolio link for technical proof.");
        }
        if (!resume.matches("(?is).*\\b(sql|mysql|postgres|mongodb)\\b.*")) {
            suggestions.add("Mention relevant database skills when they match your experience.");
        }

        return Map.of(
                "score", score,
                "suggestions", suggestions
        );
    }

    public Map<String, Object> answerQuestion(AssistantRequest request) {
        String prompt = normalize(request.getText());
        List<AssistantRequest.ChatMessage> history = request.getHistory();
        String topicContext = inferTopicContext(prompt, history);
        String intent = inferIntent(prompt);

        if (prompt.isBlank()) {
            return Map.of(
                    "answer", "Ask me a study question and I will explain it in a more human way, give an example, and suggest what to do next.",
                    "nextSteps", List.of("Add the topic", "Mention your exam or goal", "Ask for examples")
            );
        }

        Optional<Map<String, Object>> remoteResponse = invokeRemoteAssistant(prompt, history);
        if (remoteResponse.isPresent()) {
            return remoteResponse.get();
        }

        return switch (intent) {
            case "greeting" -> Map.of(
                    "answer", buildGreetingReply(topicContext, prompt, history),
                    "nextSteps", List.of(
                            "Tell me the subject you want help with.",
                            "Ask for examples if you want the idea simplified.",
                            "Share your exam target for a better revision plan."
                    )
            );
            case "quiz" -> Map.of(
                    "answer", buildQuizReply(topicContext, prompt, history),
                    "nextSteps", List.of(
                            "Answer the questions without looking at notes.",
                            "Check which ones you missed.",
                            "Ask me to turn the mistakes into flashcards."
                    )
            );
            case "plan" -> Map.of(
                    "answer", buildPlanReply(topicContext, prompt, history),
                    "nextSteps", List.of(
                            "Break the plan into a daily checklist.",
                            "Spend more time on weak topics first.",
                            "Review the plan at the end of each day."
                    )
            );
            case "compare" -> Map.of(
                    "answer", buildCompareReply(topicContext, prompt, history),
                    "nextSteps", List.of(
                            "Pick the option that fits your exam style.",
                            "Write one advantage and one disadvantage for each.",
                            "Ask for a memory trick if the difference is still unclear."
                    )
            );
            case "definition" -> Map.of(
                    "answer", buildDefinitionReply(topicContext, prompt, history),
                    "nextSteps", List.of(
                            "Rewrite the definition in your own words.",
                            "Add one example and one non-example.",
                            "Test yourself with a short question."
                    )
            );
            case "howto" -> Map.of(
                    "answer", buildHowToReply(topicContext, prompt, history),
                    "nextSteps", List.of(
                            "Follow the steps in order.",
                            "Try the method on one small example.",
                            "Ask me to simplify any step that feels hard."
                    )
            );
            case "followup" -> Map.of(
                    "answer", buildFollowUpReply(topicContext, prompt, history),
                    "nextSteps", List.of(
                            "Ask for a shorter version if you want revision notes.",
                            "Ask for an example question.",
                            "Ask for a quick recap before moving on."
                    )
            );
            default -> Map.of(
                    "answer", buildDefaultReply(topicContext, prompt, history),
                    "nextSteps", List.of(
                            "Ask for a simpler explanation.",
                            "Request an example.",
                            "Ask for practice questions or a revision plan."
                    )
            );
        };
    }

    /**
     * Streams the assistant's reply as plain text chunks, flushed as they arrive.
     * When a real provider (Gemini/OpenAI) is configured, chunks are genuine
     * token-level deltas from that model. Without one, it streams the same
     * rule-based reply used by answerQuestion(), but word-by-word with a small
     * delay so the UI still reads like a live chatbot rather than a canned reply.
     */
    public void streamAnswer(String promptRaw, List<AssistantRequest.ChatMessage> history, java.io.OutputStream out) throws IOException {
        String prompt = normalize(promptRaw);

        if (prompt.isBlank()) {
            writeTyped(out, "Ask me a study question and I will explain it, give an example, and suggest what to do next.");
            return;
        }

        String provider = normalize(aiProvider).toLowerCase();
        boolean streamed;

        if ("openai".equals(provider) || (!"gemini".equals(provider) && !openAiApiKey.isBlank())) {
            streamed = streamOpenAi(prompt, history, out);
        } else if ("gemini".equals(provider) || !geminiApiKey.isBlank()) {
            streamed = streamGemini(prompt, history, out);
        } else {
            streamed = false;
        }

        if (streamed) {
            return;
        }

        // No provider configured (or the call failed) — fall back to the same
        // rule-based reply engine, revealed progressively instead of dumped at once.
        String topicContext = inferTopicContext(prompt, history);
        String intent = inferIntent(prompt);
        String fallbackAnswer = switch (intent) {
            case "greeting" -> buildGreetingReply(topicContext, prompt, history);
            case "quiz" -> buildQuizReply(topicContext, prompt, history);
            case "plan" -> buildPlanReply(topicContext, prompt, history);
            case "compare" -> buildCompareReply(topicContext, prompt, history);
            case "definition" -> buildDefinitionReply(topicContext, prompt, history);
            case "howto" -> buildHowToReply(topicContext, prompt, history);
            case "followup" -> buildFollowUpReply(topicContext, prompt, history);
            default -> buildDefaultReply(topicContext, prompt, history);
        };
        writeTyped(out, fallbackAnswer);
    }

    private void writeTyped(java.io.OutputStream out, String text) throws IOException {
        String[] words = text.split("(?<=\\s)");
        for (String word : words) {
            out.write(word.getBytes(java.nio.charset.StandardCharsets.UTF_8));
            out.flush();
            try {
                Thread.sleep(18);
            } catch (InterruptedException interrupted) {
                Thread.currentThread().interrupt();
                return;
            }
        }
    }

    private boolean streamOpenAi(String prompt, List<AssistantRequest.ChatMessage> history, java.io.OutputStream out) {
        if (openAiApiKey.isBlank()) {
            return false;
        }

        try {
            List<Map<String, String>> messages = new ArrayList<>();
            messages.add(Map.of("role", "system", "content", CHAT_SYSTEM_PROMPT_STREAM));
            appendHistory(messages, history);
            messages.add(Map.of("role", "user", "content", prompt));

            Map<String, Object> payload = new HashMap<>();
            payload.put("model", openAiModel);
            payload.put("temperature", 0.7);
            payload.put("stream", true);
            payload.put("messages", messages);

            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create("https://api.openai.com/v1/chat/completions"))
                    .timeout(Duration.ofSeconds(60))
                    .header("Authorization", "Bearer " + openAiApiKey)
                    .header("Content-Type", "application/json")
                    .POST(HttpRequest.BodyPublishers.ofString(objectMapper.writeValueAsString(payload)))
                    .build();

            HttpResponse<java.util.stream.Stream<String>> response = httpClient.send(request, HttpResponse.BodyHandlers.ofLines());
            if (response.statusCode() < 200 || response.statusCode() >= 300) {
                return false;
            }

            boolean[] wroteAny = { false };
            response.body().forEach(line -> {
                if (!line.startsWith("data:")) {
                    return;
                }
                String data = line.substring(5).trim();
                if (data.isEmpty() || "[DONE]".equals(data)) {
                    return;
                }
                try {
                    Map<String, Object> chunk = objectMapper.readValue(data, new TypeReference<>() {
                    });
                    List<?> choices = (List<?>) chunk.get("choices");
                    if (choices == null || choices.isEmpty()) {
                        return;
                    }
                    Map<?, ?> delta = (Map<?, ?>) ((Map<?, ?>) choices.get(0)).get("delta");
                    Object contentPiece = delta == null ? null : delta.get("content");
                    if (contentPiece != null) {
                        out.write(String.valueOf(contentPiece).getBytes(java.nio.charset.StandardCharsets.UTF_8));
                        out.flush();
                        wroteAny[0] = true;
                    }
                } catch (IOException ignored) {
                    // Skip malformed chunks rather than aborting the whole stream.
                }
            });

            return wroteAny[0];
        } catch (IOException | InterruptedException exception) {
            if (exception instanceof InterruptedException) {
                Thread.currentThread().interrupt();
            }
            return false;
        } catch (RuntimeException exception) {
            return false;
        }
    }

    private boolean streamGemini(String prompt, List<AssistantRequest.ChatMessage> history, java.io.OutputStream out) {
        if (geminiApiKey.isBlank()) {
            return false;
        }

        try {
            Map<String, Object> payload = Map.of(
                    "contents", List.of(Map.of(
                            "role", "user",
                            "parts", List.of(Map.of("text", buildGeminiStreamPrompt(prompt, history)))
                    )),
                    "systemInstruction", Map.of("parts", List.of(Map.of("text", CHAT_SYSTEM_PROMPT_STREAM))),
                    "generationConfig", Map.of("temperature", 0.7)
            );

            String endpoint = "https://generativelanguage.googleapis.com/v1beta/models/" + geminiModel
                    + ":streamGenerateContent?alt=sse&key=" + geminiApiKey;

            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(endpoint))
                    .timeout(Duration.ofSeconds(60))
                    .header("Content-Type", "application/json")
                    .POST(HttpRequest.BodyPublishers.ofString(objectMapper.writeValueAsString(payload)))
                    .build();

            HttpResponse<java.util.stream.Stream<String>> response = httpClient.send(request, HttpResponse.BodyHandlers.ofLines());
            if (response.statusCode() < 200 || response.statusCode() >= 300) {
                return false;
            }

            boolean[] wroteAny = { false };
            response.body().forEach(line -> {
                if (!line.startsWith("data:")) {
                    return;
                }
                String data = line.substring(5).trim();
                if (data.isEmpty()) {
                    return;
                }
                try {
                    Map<String, Object> chunk = objectMapper.readValue(data, new TypeReference<>() {
                    });
                    List<?> candidates = (List<?>) chunk.get("candidates");
                    if (candidates == null || candidates.isEmpty()) {
                        return;
                    }
                    Map<?, ?> content = (Map<?, ?>) ((Map<?, ?>) candidates.get(0)).get("content");
                    List<?> parts = content == null ? null : (List<?>) content.get("parts");
                    if (parts == null || parts.isEmpty()) {
                        return;
                    }
                    Object text = ((Map<?, ?>) parts.get(0)).get("text");
                    if (text != null) {
                        out.write(String.valueOf(text).getBytes(java.nio.charset.StandardCharsets.UTF_8));
                        out.flush();
                        wroteAny[0] = true;
                    }
                } catch (IOException ignored) {
                    // Skip malformed chunks rather than aborting the whole stream.
                }
            });

            return wroteAny[0];
        } catch (IOException | InterruptedException exception) {
            if (exception instanceof InterruptedException) {
                Thread.currentThread().interrupt();
            }
            return false;
        } catch (RuntimeException exception) {
            return false;
        }
    }

    private String buildGeminiStreamPrompt(String prompt, List<AssistantRequest.ChatMessage> history) {
        StringBuilder builder = new StringBuilder();
        builder.append("Conversation history:\n");
        appendHistory(builder, history);
        builder.append("\nUser question:\n").append(prompt).append("\n");
        return builder.toString();
    }

    private Optional<Map<String, Object>> invokeRemoteAssistant(String prompt, List<AssistantRequest.ChatMessage> history) {
        String provider = normalize(aiProvider).toLowerCase();

        if ("openai".equals(provider)) {
            return invokeOpenAi(prompt, history);
        }

        if ("gemini".equals(provider)) {
            return invokeGemini(prompt, history);
        }

        if (!openAiApiKey.isBlank()) {
            return invokeOpenAi(prompt, history);
        }

        if (!geminiApiKey.isBlank()) {
            return invokeGemini(prompt, history);
        }

        return Optional.empty();
    }

    private Optional<Map<String, Object>> invokeOpenAi(String prompt, List<AssistantRequest.ChatMessage> history) {
        if (openAiApiKey.isBlank()) {
            return Optional.empty();
        }

        try {
            Map<String, Object> payload = new HashMap<>();
            payload.put("model", openAiModel);
            payload.put("response_format", Map.of("type", "json_object"));
            payload.put("temperature", 0.7);
            payload.put("messages", buildOpenAiMessages(prompt, history));

            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create("https://api.openai.com/v1/chat/completions"))
                    .timeout(Duration.ofSeconds(30))
                    .header("Authorization", "Bearer " + openAiApiKey)
                    .header("Content-Type", "application/json")
                    .POST(HttpRequest.BodyPublishers.ofString(objectMapper.writeValueAsString(payload)))
                    .build();

            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
            if (response.statusCode() < 200 || response.statusCode() >= 300) {
                return Optional.empty();
            }

            Map<String, Object> body = objectMapper.readValue(response.body(), new TypeReference<>() {
            });
            List<?> choices = (List<?>) body.get("choices");
            if (choices == null || choices.isEmpty()) {
                return Optional.empty();
            }

            Map<?, ?> firstChoice = (Map<?, ?>) choices.get(0);
            Map<?, ?> message = (Map<?, ?>) firstChoice.get("message");
            String content = message == null ? null : String.valueOf(message.get("content"));
            return parseStructuredAssistantResponse(content).or(() -> Optional.of(defaultResponse(content)));
        } catch (IOException exception) {
            return Optional.empty();
        } catch (InterruptedException exception) {
            Thread.currentThread().interrupt();
            return Optional.empty();
        } catch (RuntimeException exception) {
            return Optional.empty();
        }
    }

    private Optional<Map<String, Object>> invokeGemini(String prompt, List<AssistantRequest.ChatMessage> history) {
        if (geminiApiKey.isBlank()) {
            return Optional.empty();
        }

        try {
            Map<String, Object> payload = Map.of(
                    "contents", List.of(Map.of(
                            "role", "user",
                            "parts", List.of(Map.of("text", buildGeminiPrompt(prompt, history)))
                    )),
                    "systemInstruction", Map.of("parts", List.of(Map.of("text", CHAT_SYSTEM_PROMPT))),
                    "generationConfig", Map.of(
                            "temperature", 0.7,
                            "responseMimeType", "application/json"
                    )
            );

            String endpoint = "https://generativelanguage.googleapis.com/v1beta/models/" + geminiModel + ":generateContent?key=" + geminiApiKey;
            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(endpoint))
                    .timeout(Duration.ofSeconds(30))
                    .header("Content-Type", "application/json")
                    .POST(HttpRequest.BodyPublishers.ofString(objectMapper.writeValueAsString(payload)))
                    .build();

            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
            if (response.statusCode() < 200 || response.statusCode() >= 300) {
                return Optional.empty();
            }

            Map<String, Object> body = objectMapper.readValue(response.body(), new TypeReference<>() {
            });
            List<?> candidates = (List<?>) body.get("candidates");
            if (candidates == null || candidates.isEmpty()) {
                return Optional.empty();
            }

            Map<?, ?> firstCandidate = (Map<?, ?>) candidates.get(0);
            Map<?, ?> content = (Map<?, ?>) firstCandidate.get("content");
            List<?> parts = content == null ? null : (List<?>) content.get("parts");
            if (parts == null || parts.isEmpty()) {
                return Optional.empty();
            }

            Map<?, ?> firstPart = (Map<?, ?>) parts.get(0);
            String text = firstPart == null ? null : String.valueOf(firstPart.get("text"));
            return parseStructuredAssistantResponse(text).or(() -> Optional.of(defaultResponse(text)));
        } catch (IOException | InterruptedException exception) {
            Thread.currentThread().interrupt();
            return Optional.empty();
        } catch (RuntimeException exception) {
            return Optional.empty();
        }
    }

    private List<Map<String, String>> buildOpenAiMessages(String prompt, List<AssistantRequest.ChatMessage> history) {
        List<Map<String, String>> messages = new ArrayList<>();
        messages.add(Map.of("role", "system", "content", CHAT_SYSTEM_PROMPT));
        appendHistory(messages, history);
        messages.add(Map.of("role", "user", "content", prompt));
        return messages;
    }

    private String buildGeminiPrompt(String prompt, List<AssistantRequest.ChatMessage> history) {
        StringBuilder builder = new StringBuilder();
        builder.append("Conversation history:\n");
        appendHistory(builder, history);
        builder.append("\nUser question:\n").append(prompt).append("\n");
        builder.append("Return JSON with answer and nextSteps only.");
        return builder.toString();
    }

    private void appendHistory(StringBuilder builder, List<AssistantRequest.ChatMessage> history) {
        if (history == null || history.isEmpty()) {
            return;
        }

        int startIndex = Math.max(0, history.size() - 8);
        for (int i = startIndex; i < history.size(); i++) {
            AssistantRequest.ChatMessage message = history.get(i);
            if (message == null || message.getContent() == null) {
                continue;
            }

            String role = normalize(message.getRole()).toLowerCase();
            if (!"user".equals(role) && !"assistant".equals(role)) {
                continue;
            }

            builder.append(role)
                    .append(": ")
                    .append(normalize(message.getContent()))
                    .append('\n');
        }
    }

    private void appendHistory(List<Map<String, String>> messages, List<AssistantRequest.ChatMessage> history) {
        if (history == null || history.isEmpty()) {
            return;
        }

        int startIndex = Math.max(0, history.size() - 8);
        for (int i = startIndex; i < history.size(); i++) {
            AssistantRequest.ChatMessage message = history.get(i);
            if (message == null || message.getContent() == null) {
                continue;
            }

            String role = normalize(message.getRole()).toLowerCase();
            if (!"user".equals(role) && !"assistant".equals(role)) {
                continue;
            }

            messages.add(Map.of(
                    "role", role,
                    "content", normalize(message.getContent())
            ));
        }
    }

    private String buildGreetingReply(String topicContext, String prompt, List<AssistantRequest.ChatMessage> history) {
        String subject = topicContext.isBlank() ? inferTopicContextFromHistory(history) : topicContext;
        if (!subject.isBlank()) {
            return "Hi. We can keep this focused on " + subject + ". I can explain it, compare it with related ideas, quiz you, or turn it into a short revision plan. If you want, send the exact part that feels confusing.";
        }

        return "Hi. I can act like a study chatbot: explain concepts, answer follow-up questions, quiz you, or turn your topic into a revision plan. Tell me the subject and I will respond in a more natural, context-aware way.";
    }

    private String buildQuizReply(String topicContext, String prompt, List<AssistantRequest.ChatMessage> history) {
        String subject = resolveSubject(topicContext, prompt, history);
        return "Let's test " + subject + ". Try answering three things: 1) the basic definition, 2) one simple example, and 3) one tricky follow-up question. When you reply, I will check your answer and explain what to fix.";
    }

    private String buildPlanReply(String topicContext, String prompt, List<AssistantRequest.ChatMessage> history) {
        String subject = resolveSubject(topicContext, prompt, history);
        return "For " + subject + ", I would start with the highest-priority weak area, study it for a short block, then do one recall question and one practice question. If the exam is near, shift more time into revision and active recall than reading.";
    }

    private String buildCompareReply(String topicContext, String prompt, List<AssistantRequest.ChatMessage> history) {
        String subject = resolveSubject(topicContext, prompt, history);
        return "To compare the options in " + subject + ", look at what each one is for, when you would use it, and one example. If you give me the two items, I can compare them directly in a simple table.";
    }

    private String buildDefinitionReply(String topicContext, String prompt, List<AssistantRequest.ChatMessage> history) {
        String subject = resolveSubject(topicContext, prompt, history);
        return subject + " means the core idea behind the topic. A good way to remember it is: one sentence definition, one plain-English example, and one exam-style question. If you want, I can make it even shorter or easier.";
    }

    private String buildHowToReply(String topicContext, String prompt, List<AssistantRequest.ChatMessage> history) {
        String subject = resolveSubject(topicContext, prompt, history);
        return "For " + subject + ", follow this order: understand the concept, see one worked example, then try it yourself without notes. If you get stuck, tell me which step failed and I will guide you from there.";
    }

    private String buildFollowUpReply(String topicContext, String prompt, List<AssistantRequest.ChatMessage> history) {
        String subject = topicContext.isBlank() ? inferTopicContextFromHistory(history) : topicContext;
        if (!subject.isBlank()) {
            return "Building on " + subject + ", the best next move is to connect this to one example or to the earlier idea you already know. If you want, I can make it shorter, more detailed, or convert it into practice questions.";
        }

        return "That follows from the earlier point. Tell me the topic again or share the last thing you were asking about, and I will continue from there.";
    }

    private String buildDefaultReply(String topicContext, String prompt, List<AssistantRequest.ChatMessage> history) {
        String subject = resolveSubject(topicContext, prompt, history);
        return "For " + subject + ", start with the definition, then one example, then one quick practice task. If you want, I can also turn it into revision notes or quiz questions.";
    }

    private String resolveSubject(String topicContext, String prompt, List<AssistantRequest.ChatMessage> history) {
        if (!topicContext.isBlank()) {
            return topicContext;
        }

        String subject = inferTopicContextFromHistory(history);
        if (!subject.isBlank()) {
            return subject;
        }

        return prompt.isBlank() ? "this topic" : prompt;
    }

    private Optional<Map<String, Object>> parseStructuredAssistantResponse(String content) {
        if (content == null || content.isBlank()) {
            return Optional.empty();
        }

        String normalized = content.trim();
        if (normalized.startsWith("```")) {
            normalized = normalized.replaceFirst("(?s)^```(?:json)?\\s*", "");
            normalized = normalized.replaceFirst("(?s)\\s*```$", "");
        }

        try {
            Map<String, Object> parsed = objectMapper.readValue(normalized, new TypeReference<>() {
            });
            Object answer = parsed.get("answer");
            if (answer == null) {
                return Optional.empty();
            }

            List<String> nextSteps = new ArrayList<>();
            Object steps = parsed.get("nextSteps");
            if (steps instanceof List<?> stepList) {
                for (Object step : stepList) {
                    if (step != null) {
                        nextSteps.add(String.valueOf(step));
                    }
                }
            }

            return Optional.of(Map.of(
                    "answer", String.valueOf(answer),
                    "nextSteps", nextSteps.isEmpty()
                            ? List.of("Ask for a simpler explanation.", "Ask for an example.", "Ask for practice questions.")
                            : nextSteps.stream().limit(3).toList(),
                    "provider", "remote-model"
            ));
        } catch (JsonProcessingException exception) {
            return Optional.empty();
        }
    }

    private Map<String, Object> defaultResponse(String content) {
        String answer = normalize(content);
        if (answer.isBlank()) {
            answer = "I can explain that more clearly if you ask again with the topic name or a specific follow-up.";
        }

        return Map.of(
                "answer", answer,
                "nextSteps", List.of(
                        "Ask for a shorter explanation.",
                        "Ask for one example.",
                        "Ask for practice questions."
                ),
                "provider", "remote-model"
        );
    }

    private String inferIntent(String prompt) {
        String lower = prompt.toLowerCase();

        if (containsAny(lower, "hi", "hello", "hey", "good morning", "good evening")) {
            return "greeting";
        }
        if (containsAny(lower, "quiz", "test me", "mcq", "practice question", "question bank")) {
            return "quiz";
        }
        if (containsAny(lower, "plan", "schedule", "timetable", "revise", "revision", "study plan")) {
            return "plan";
        }
        if (containsAny(lower, "compare", "difference", "versus", "vs", "better")) {
            return "compare";
        }
        if (containsAny(lower, "what is", "define", "definition", "meaning of", "explain")) {
            return "definition";
        }
        if (containsAny(lower, "how do i", "how to", "steps to", "method", "way to")) {
            return "howto";
        }
        if (containsAny(lower, "also", "what about", "follow up", "then", "that means", "why")) {
            return "followup";
        }

        return "default";
    }

    private String inferTopicContext(String prompt, List<AssistantRequest.ChatMessage> history) {
        if (!prompt.isBlank()) {
            String cleaned = prompt
                    .replaceAll("(?i)^(what is|define|definition of|explain|how to|how do i|tell me about|compare|difference between|quiz me on|make a plan for|make a study plan for)\\s+", "")
                    .trim();
            if (!cleaned.isBlank() && cleaned.length() < prompt.length()) {
                return cleaned;
            }
        }

        return inferTopicContextFromHistory(history);
    }

    private String inferTopicContextFromHistory(List<AssistantRequest.ChatMessage> history) {
        if (history == null || history.isEmpty()) {
            return "";
        }

        for (int i = history.size() - 1; i >= 0; i--) {
            AssistantRequest.ChatMessage message = history.get(i);
            if (message != null && "user".equalsIgnoreCase(message.getRole())) {
                String content = normalize(message.getContent());
                if (!content.isBlank()) {
                    return content;
                }
            }
        }

        return "";
    }

    private boolean containsAny(String text, String... phrases) {
        for (String phrase : phrases) {
            if (text.contains(phrase)) {
                return true;
            }
        }
        return false;
    }

    private String normalize(String value) {
        return value == null ? "" : value.trim().replaceAll("\\s+", " ");
    }

    private List<String> splitSentences(String text) {
        if (text.isBlank()) {
            return List.of();
        }
        return Arrays.stream(text.split("(?<=[.!?])\\s+"))
                .map(String::trim)
                .filter(sentence -> !sentence.isBlank())
                .toList();
    }
}
