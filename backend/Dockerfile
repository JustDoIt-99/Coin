FROM eclipse-temurin:17-jdk AS builder
WORKDIR /app

COPY gradlew gradlew
COPY gradle gradle
COPY build.gradle settings.gradle ./
RUN chmod +x gradlew
RUN ./gradlew dependencies --no-daemon

COPY src src
RUN ./gradlew bootJar --no-daemon

FROM eclipse-temurin:17-jre
WORKDIR /app

RUN addgroup --system coinco && adduser --system --ingroup coinco coinco

COPY --from=builder /app/build/libs/*.jar app.jar
RUN chown coinco:coinco /app/app.jar
RUN mkdir -p /app/logs && chown -R coinco:coinco /app/logs

USER coinco

EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
