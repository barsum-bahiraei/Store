FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src

COPY Store.slnx ./
COPY Src/Core/Store.Domain/Store.Domain.csproj Src/Core/Store.Domain/
COPY Src/Core/Store.Service/Store.Service.csproj Src/Core/Store.Service/
COPY Src/Infrastructure/Store.Persistent/Store.Persistent.csproj Src/Infrastructure/Store.Persistent/
COPY Src/Endpoint/Store.Api/Store.Api.csproj Src/Endpoint/Store.Api/
RUN dotnet restore Src/Endpoint/Store.Api/Store.Api.csproj

COPY . .
RUN dotnet publish Src/Endpoint/Store.Api/Store.Api.csproj \
    --configuration Release \
    --output /app/publish \
    --no-restore \
    /p:UseAppHost=false

FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS runtime
WORKDIR /app
ENV ASPNETCORE_HTTP_PORTS=8080 \
    DOTNET_EnableDiagnostics=0
EXPOSE 8080
COPY --from=build /app/publish .
USER app
ENTRYPOINT ["dotnet", "Store.Api.dll"]
