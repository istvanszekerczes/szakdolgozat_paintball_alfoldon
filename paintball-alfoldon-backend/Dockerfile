FROM eclipse-temurin:21-jdk AS build
WORKDIR /app
COPY gradlew settings.gradle build.gradle ./
COPY gradle ./gradle
# Dependencies get their own layer, so a code change doesn't download them again.
RUN sh gradlew --no-daemon dependencies > /dev/null
COPY src ./src
RUN sh gradlew --no-daemon bootJar

FROM eclipse-temurin:21-jre
WORKDIR /app
COPY --from=build /app/build/libs/*.jar app.jar
RUN useradd --system app
USER app
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
