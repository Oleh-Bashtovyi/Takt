FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src

COPY Directory.Build.props Directory.Packages.props Takt.Backend.slnx ./
COPY Takt.Domain/Takt.Domain.csproj Takt.Domain/
COPY Takt.Application/Takt.Application.csproj Takt.Application/
COPY Takt.Infrastructure/Takt.Infrastructure.csproj Takt.Infrastructure/
COPY Takt.API/Takt.API.csproj Takt.API/
COPY Takt.DbMigrator/Takt.DbMigrator.csproj Takt.DbMigrator/

RUN dotnet restore Takt.DbMigrator/Takt.DbMigrator.csproj

COPY . .

RUN dotnet publish Takt.DbMigrator/Takt.DbMigrator.csproj -c Release -o /app/publish --no-restore

FROM mcr.microsoft.com/dotnet/runtime:10.0 AS runtime
WORKDIR /app

COPY --from=build /app/publish .
# The migrator walks up from its base directory to find Takt.API and load its config.
COPY --from=build /src/Takt.API/appsettings.json Takt.API/appsettings.json

USER $APP_UID
ENTRYPOINT ["dotnet", "Takt.DbMigrator.dll"]
