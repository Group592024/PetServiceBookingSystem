FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# Copy solution file
COPY PSBS.ApiGatewaySolution/*.sln ./PSBS.ApiGatewaySolution/

# Copy project files - using the folder names as they exist
COPY PSBS.ApiGatewaySolution/PSBS.ApiGatewaySolution/*.csproj ./PSBS.ApiGatewaySolution/PSBS.ApiGatewaySolution/

# Copy the shared library project file
COPY PSBS.SharedLibrarySolution/PSPS.SharedLibrary/*.csproj ./PSBS.SharedLibrarySolution/PSPS.SharedLibrary/

# Change to the solution directory before restore
WORKDIR /src/PSBS.ApiGatewaySolution
RUN dotnet restore

# Go back to the src directory
WORKDIR /src

# Copy all source code
COPY PSBS.ApiGatewaySolution/ ./PSBS.ApiGatewaySolution/
COPY PSBS.SharedLibrarySolution/ ./PSBS.SharedLibrarySolution/

# Build and publish - using the folder name
WORKDIR /src/PSBS.ApiGatewaySolution
RUN dotnet publish -c Release -o /app/out

# Build runtime image
FROM mcr.microsoft.com/dotnet/aspnet:8.0
WORKDIR /app

# Use the same path as where the files were published
COPY --from=build /app/out .
EXPOSE 5050

# Fix the DLL name to match the actual built DLL
ENTRYPOINT ["dotnet", "PSBS.ApiGatewaySolution.dll"]
