# Build stage
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# Copy solution file
COPY PSBS.FacilityServiceApiSolution/*.sln ./PSBS.FacilityServiceApiSolution/

# Copy project files
COPY PSBS.FacilityServiceApiSolution/FacilityServiceApi.Domain/*.csproj ./PSBS.FacilityServiceApiSolution/FacilityServiceApi.Domain/
COPY PSBS.FacilityServiceApiSolution/FacilityServiceApi.Application/*.csproj ./PSBS.FacilityServiceApiSolution/FacilityServiceApi.Application/
COPY PSBS.FacilityServiceApiSolution/FacilityServiceApi.Infrastructure/*.csproj ./PSBS.FacilityServiceApiSolution/FacilityServiceApi.Infrastructure/
COPY PSBS.FacilityServiceApiSolution/FacilityServiceApi.Presentation/*.csproj ./PSBS.FacilityServiceApiSolution/FacilityServiceApi.Presentation/
COPY PSBS.FacilityServiceApiSolution/UnitTest.FacilityServiceApi/*.csproj ./PSBS.FacilityServiceApiSolution/UnitTest.FacilityServiceApi/
COPY PSBS.SharedLibrarySolution/PSPS.SharedLibrary/*.csproj ./PSBS.SharedLibrarySolution/PSPS.SharedLibrary/

WORKDIR /src/PSBS.FacilityServiceApiSolution
RUN dotnet restore

WORKDIR /src
COPY PSBS.FacilityServiceApiSolution/ ./PSBS.FacilityServiceApiSolution/
COPY PSBS.SharedLibrarySolution/ ./PSBS.SharedLibrarySolution/

WORKDIR /src/PSBS.FacilityServiceApiSolution
RUN dotnet publish -c Release -o /app/out

# Runtime stage
FROM mcr.microsoft.com/dotnet/aspnet:8.0
WORKDIR /app

RUN apt-get update && \
    apt-get install -y ffmpeg && \
    rm -rf /var/lib/apt/lists/*

COPY --from=build /app/out .
# Create the images directory
RUN mkdir -p /app/Images
RUN mkdir -p /app/images /app/wwwroot/hls

EXPOSE 5023

ENTRYPOINT ["dotnet", "FacilityServiceApi.Presentation.dll"]
