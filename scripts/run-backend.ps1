# Build and run Spring Boot backend
cd backend
mvn -B -DskipTests package
java -jar target/*.jar
