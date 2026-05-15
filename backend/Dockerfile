# --- Stage 1: build (compila o jar para produção) ---
FROM maven:3.9-eclipse-temurin-21 AS build
WORKDIR /workspace

# Copy POM and download deps (cached layer)
COPY pom.xml ./
RUN mvn -B dependency:go-offline

# Copy source and package
COPY src ./src
RUN mvn -B clean package -DskipTests

# --- Stage 2: dev (usado pelo docker-compose.override.yml em desenvolvimento) ---
FROM maven:3.9-eclipse-temurin-21 AS dev
WORKDIR /app

# Pré-baixa dependências para acelerar primeiro start
COPY pom.xml ./
RUN mvn -B dependency:go-offline

# O código fonte é montado como volume em desenvolvimento; copiamos como fallback
COPY src ./src

EXPOSE 8080 35729
# spring-boot:run com fork=false mantém o processo no PID 1 (necessário no container)
CMD ["mvn", "spring-boot:run", "-Dspring-boot.run.fork=false"]

# --- Stage 3: runtime (produção, jar empacotado) ---
FROM eclipse-temurin:21-jre-alpine AS runtime
WORKDIR /app
COPY --from=build /workspace/target/*.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "/app/app.jar"]
