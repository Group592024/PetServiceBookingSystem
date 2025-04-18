# Build stage
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# Copy solution file
COPY PSBS.PetServiceApiSolution/*.sln ./PSBS.PetServiceApiSolution/

# Copy project files
COPY PSBS.PetServiceApiSolution/PetApi.Domain/*.csproj ./PSBS.PetServiceApiSolution/PetApi.Domain/
COPY PSBS.PetServiceApiSolution/PetApi.Application/*.csproj ./PSBS.PetServiceApiSolution/PetApi.Application/
COPY PSBS.PetServiceApiSolution/PetApi.Infrastructure/*.csproj ./PSBS.PetServiceApiSolution/PetApi.Infrastructure/
COPY PSBS.PetServiceApiSolution/PetApi.Presentation/*.csproj ./PSBS.PetServiceApiSolution/PetApi.Presentation/
COPY PSBS.PetServiceApiSolution/UnitTest.PetServiceApi/*.csproj ./PSBS.PetServiceApiSolution/UnitTest.PetServiceApi/
COPY PSBS.SharedLibrarySolution/PSPS.SharedLibrary/*.csproj ./PSBS.SharedLibrarySolution/PSPS.SharedLibrary/

WORKDIR /src/PSBS.PetServiceApiSolution
RUN dotnet restore

WORKDIR /src
COPY PSBS.PetServiceApiSolution/ ./PSBS.PetServiceApiSolution/
COPY PSBS.SharedLibrarySolution/ ./PSBS.SharedLibrarySolution/

WORKDIR /src/PSBS.PetServiceApiSolution
RUN dotnet publish -c Release -o /app/out

# Runtime stage
FROM mcr.microsoft.com/dotnet/aspnet:8.0
WORKDIR /app

COPY --from=build /app/out .
# Create the images directory
RUN mkdir -p /app/images
RUN mkdir -p /app/Images
EXPOSE 5010

ENTRYPOINT ["dotnet", "PetApi.Presentation.dll"]
