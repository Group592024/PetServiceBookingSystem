FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# Copy solution file
COPY PSBS.AccountServiceApiSolution/*.sln ./PSBS.AccountServiceApiSolution/

# Copy project files - using the folder names as they exist
COPY PSBS.AccountServiceApiSolution/PSPS.AuthenticationAPI.Domain/*.csproj ./PSBS.AccountServiceApiSolution/PSPS.AuthenticationAPI.Domain/
COPY PSBS.AccountServiceApiSolution/PSPS.AuthenticationAPI.Application/*.csproj ./PSBS.AccountServiceApiSolution/PSPS.AuthenticationAPI.Application/
COPY PSBS.AccountServiceApiSolution/PSPS.AuthenticationAPI.Infrastructure/*.csproj ./PSBS.AccountServiceApiSolution/PSPS.AuthenticationAPI.Infrastructure/
COPY PSBS.AccountServiceApiSolution/PSPS.AuthenticationAPI.Presentation/*.csproj ./PSBS.AccountServiceApiSolution/PSPS.AuthenticationAPI.Presentation/
# Add the missing test project
COPY PSBS.AccountServiceApiSolution/UnitTest.AccountServiceApi/*.csproj ./PSBS.AccountServiceApiSolution/UnitTest.AccountServiceApi/

# Copy the shared library project file
COPY PSBS.SharedLibrarySolution/PSPS.SharedLibrary/*.csproj ./PSBS.SharedLibrarySolution/PSPS.SharedLibrary/

# Change to the solution directory before restore
WORKDIR /src/PSBS.AccountServiceApiSolution
RUN dotnet restore

# Go back to the src directory
WORKDIR /src

# Copy all source code
COPY PSBS.AccountServiceApiSolution/ ./PSBS.AccountServiceApiSolution/
COPY PSBS.SharedLibrarySolution/ ./PSBS.SharedLibrarySolution/

# Build and publish - using the folder name
WORKDIR /src/PSBS.AccountServiceApiSolution
RUN dotnet publish -c Release -o /app/out

# Build runtime image
FROM mcr.microsoft.com/dotnet/aspnet:8.0
WORKDIR /app
# Use the same path as where the files were published
COPY --from=build /app/out .
# Create the images directory
RUN mkdir -p /app/images

EXPOSE 5000
# Fix the DLL name to match the actual built DLL
ENTRYPOINT ["dotnet", "PSPS.AccountAPI.Presentation.dll"]
