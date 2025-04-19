# Build stage
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# Copy solution file
COPY PSBS.ReservationServiceApiSolution/*.sln ./PSBS.ReservationServiceApiSolution/

# Copy project files
COPY PSBS.ReservationServiceApiSolution/ReservationApi.Domain/*.csproj ./PSBS.ReservationServiceApiSolution/ReservationApi.Domain/
COPY PSBS.ReservationServiceApiSolution/ReservationApi.Application/*.csproj ./PSBS.ReservationServiceApiSolution/ReservationApi.Application/
COPY PSBS.ReservationServiceApiSolution/ReservationApi.Infrastructure/*.csproj ./PSBS.ReservationServiceApiSolution/ReservationApi.Infrastructure/
COPY PSBS.ReservationServiceApiSolution/ReservationApi.Presentation/*.csproj ./PSBS.ReservationServiceApiSolution/ReservationApi.Presentation/
COPY PSBS.ReservationServiceApiSolution/UnitTest.ReservationApi/*.csproj ./PSBS.ReservationServiceApiSolution/UnitTest.ReservationApi/
COPY PSBS.SharedLibrarySolution/PSPS.SharedLibrary/*.csproj ./PSBS.SharedLibrarySolution/PSPS.SharedLibrary/

WORKDIR /src/PSBS.ReservationServiceApiSolution
RUN dotnet restore

WORKDIR /src
COPY PSBS.ReservationServiceApiSolution/ ./PSBS.ReservationServiceApiSolution/
COPY PSBS.SharedLibrarySolution/ ./PSBS.SharedLibrarySolution/

WORKDIR /src/PSBS.ReservationServiceApiSolution
RUN dotnet publish -c Release -o /app/out

# Runtime stage
FROM mcr.microsoft.com/dotnet/aspnet:8.0
WORKDIR /app

COPY --from=build /app/out .
COPY PSBS.ReservationServiceApiSolution/ReservationApi.Presentation/https /app/https
EXPOSE 5115
EXPOSE 5201

ENTRYPOINT ["dotnet", "ReservationApi.Presentation.dll"]
