# Build stage
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# Copy solution file
COPY PSBS.RewardServiceApiSolution/*.sln ./PSBS.RewardServiceApiSolution/

# Copy project files
COPY PSBS.RewardServiceApiSolution/VoucherApi.Domain/*.csproj ./PSBS.RewardServiceApiSolution/VoucherApi.Domain/
COPY PSBS.RewardServiceApiSolution/VoucherApi.Application/*.csproj ./PSBS.RewardServiceApiSolution/VoucherApi.Application/
COPY PSBS.RewardServiceApiSolution/VoucherApi.Infrastructure/*.csproj ./PSBS.RewardServiceApiSolution/VoucherApi.Infrastructure/
COPY PSBS.RewardServiceApiSolution/VoucherApi.Presentation/*.csproj ./PSBS.RewardServiceApiSolution/VoucherApi.Presentation/
COPY PSBS.RewardServiceApiSolution/UnitTest.RewardServiceApi/*.csproj ./PSBS.RewardServiceApiSolution/UnitTest.RewardServiceApi/
COPY PSBS.SharedLibrarySolution/PSPS.SharedLibrary/*.csproj ./PSBS.SharedLibrarySolution/PSPS.SharedLibrary/

WORKDIR /src/PSBS.RewardServiceApiSolution
RUN dotnet restore

WORKDIR /src
COPY PSBS.RewardServiceApiSolution/ ./PSBS.RewardServiceApiSolution/
COPY PSBS.SharedLibrarySolution/ ./PSBS.SharedLibrarySolution/

WORKDIR /src/PSBS.RewardServiceApiSolution
RUN dotnet publish -c Release -o /app/out

# Runtime stage
FROM mcr.microsoft.com/dotnet/aspnet:8.0
WORKDIR /app

COPY --from=build /app/out .
# Create the images directory
RUN mkdir -p /app/ImageGifts


EXPOSE 5022

ENTRYPOINT ["dotnet", "VoucherApi.Presentation.dll"]
