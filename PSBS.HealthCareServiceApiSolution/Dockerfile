# Build stage
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# Copy solution file
COPY PSBS.HealthCareServiceApiSolution/*.sln ./PSBS.HealthCareServiceApiSolution/

# Copy project files
COPY PSBS.HealthCareServiceApiSolution/PSBS.HealthCareApi.Domain/*.csproj ./PSBS.HealthCareServiceApiSolution/PSBS.HealthCareApi.Domain/
COPY PSBS.HealthCareServiceApiSolution/PSBS.HealthCareApi.Application/*.csproj ./PSBS.HealthCareServiceApiSolution/PSBS.HealthCareApi.Application/
COPY PSBS.HealthCareServiceApiSolution/PSBS.HealthCareApi.Infrastructure/*.csproj ./PSBS.HealthCareServiceApiSolution/PSBS.HealthCareApi.Infrastructure/
COPY PSBS.HealthCareServiceApiSolution/PSBS.HealthCareApi.Presentation/*.csproj ./PSBS.HealthCareServiceApiSolution/PSBS.HealthCareApi.Presentation/
COPY PSBS.HealthCareServiceApiSolution/UnitTest.HealthCareServiceApi/*.csproj ./PSBS.HealthCareServiceApiSolution/UnitTest.HealthCareServiceApi/
COPY PSBS.SharedLibrarySolution/PSPS.SharedLibrary/*.csproj ./PSBS.SharedLibrarySolution/PSPS.SharedLibrary/

WORKDIR /src/PSBS.HealthCareServiceApiSolution
RUN dotnet restore

WORKDIR /src
COPY PSBS.HealthCareServiceApiSolution/ ./PSBS.HealthCareServiceApiSolution/
COPY PSBS.SharedLibrarySolution/ ./PSBS.SharedLibrarySolution/

WORKDIR /src/PSBS.HealthCareServiceApiSolution
RUN dotnet publish -c Release -o /app/out

# Runtime stage
FROM mcr.microsoft.com/dotnet/aspnet:8.0
WORKDIR /app

RUN apt-get update && \
    apt-get install -y ffmpeg && \
    rm -rf /var/lib/apt/lists/*

COPY --from=build /app/out .
# Create the images directory
RUN mkdir -p /app/ImageMedicines


EXPOSE 5003

ENTRYPOINT ["dotnet", "PSBS.HealthCareApi.Presentation.dll"]
