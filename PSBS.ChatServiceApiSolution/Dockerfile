FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# Copy solution file
COPY PSBS.ChatServiceApiSolution/*.sln ./PSBS.ChatServiceApiSolution/

# Copy project files - using the folder names as they exist
COPY PSBS.ChatServiceApiSolution/ChatServiceApi.Domain/*.csproj ./PSBS.ChatServiceApiSolution/ChatServiceApi.Domain/
COPY PSBS.ChatServiceApiSolution/ChatServiceApi.Application/*.csproj ./PSBS.ChatServiceApiSolution/ChatServiceApi.Application/
COPY PSBS.ChatServiceApiSolution/ChatServiceApi.Infrastructure/*.csproj ./PSBS.ChatServiceApiSolution/ChatServiceApi.Infrastructure/
COPY PSBS.ChatServiceApiSolution/ChatServiceApi.Presentation/*.csproj ./PSBS.ChatServiceApiSolution/ChatServiceApi.Presentation/
# Add the missing test project
COPY PSBS.ChatServiceApiSolution/UnitTest.ChatServiceApi/*.csproj ./PSBS.ChatServiceApiSolution/UnitTest.ChatServiceApi/

# Copy the shared library project file
COPY PSBS.SharedLibrarySolution/PSPS.SharedLibrary/*.csproj ./PSBS.SharedLibrarySolution/PSPS.SharedLibrary/

# Change to the solution directory before restore
WORKDIR /src/PSBS.ChatServiceApiSolution
RUN dotnet restore

# Go back to the src directory
WORKDIR /src

# Copy all source code
COPY PSBS.ChatServiceApiSolution/ ./PSBS.ChatServiceApiSolution/
COPY PSBS.SharedLibrarySolution/ ./PSBS.SharedLibrarySolution/

# Build and publish - using the folder name
WORKDIR /src/PSBS.ChatServiceApiSolution
RUN dotnet publish -c Release -o /app/out

# Build runtime image
FROM mcr.microsoft.com/dotnet/aspnet:8.0
WORKDIR /app
# Use the same path as where the files were published
COPY --from=build /app/out .
# Create the images directory
RUN mkdir -p /app/wwwroot
EXPOSE 5159
# Fix the DLL name to match the actual built DLL
ENTRYPOINT ["dotnet", "ChatServiceApi.Presentation.dll"]
