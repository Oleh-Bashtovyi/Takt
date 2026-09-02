FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src

COPY Directory.Build.props Directory.Packages.props Takt.Backend.slnx ./
COPY Takt.Domain/Takt.Domain.csproj Takt.Domain/
COPY Takt.Application/Takt.Application.csproj Takt.Application/
COPY Takt.Infrastructure/Takt.Infrastructure.csproj Takt.Infrastructure/
COPY Takt.API/Takt.API.csproj Takt.API/
COPY Takt.DbMigrator/Takt.DbMigrator.csproj Takt.DbMigrator/

RUN dotnet restore Takt.API/Takt.API.csproj

COPY . .

RUN dotnet publish Takt.API/Takt.API.csproj -c Release -o /app/publish --no-restore

FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS runtime
WORKDIR /app

COPY --from=build /app/publish .

USER $APP_UID
EXPOSE 8080
ENTRYPOINT ["dotnet", "Takt.API.dll"]
