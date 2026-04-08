using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace backend.Migrations
{
    /// <inheritdoc />
    public partial class AddPredictionTables : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "donor_retention_predictions",
                columns: table => new
                {
                    prediction_id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    supporter_id = table.Column<int>(type: "integer", nullable: false),
                    as_of_date = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    lapse_risk_probability = table.Column<double>(type: "double precision", nullable: false),
                    risk_band = table.Column<string>(type: "text", nullable: true),
                    model_version = table.Column<string>(type: "text", nullable: false),
                    scored_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_donor_retention_predictions", x => x.prediction_id);
                });

            migrationBuilder.CreateTable(
                name: "incident_risk_predictions",
                columns: table => new
                {
                    prediction_id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    resident_id = table.Column<int>(type: "integer", nullable: false),
                    as_of_date = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    incident_risk_probability = table.Column<double>(type: "double precision", nullable: false),
                    risk_band = table.Column<string>(type: "text", nullable: true),
                    model_version = table.Column<string>(type: "text", nullable: false),
                    scored_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_incident_risk_predictions", x => x.prediction_id);
                });

            migrationBuilder.CreateTable(
                name: "resident_progress_predictions",
                columns: table => new
                {
                    prediction_id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    resident_id = table.Column<int>(type: "integer", nullable: false),
                    as_of_date = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    low_progress_risk_probability = table.Column<double>(type: "double precision", nullable: false),
                    priority_band = table.Column<string>(type: "text", nullable: true),
                    model_version = table.Column<string>(type: "text", nullable: false),
                    scored_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_resident_progress_predictions", x => x.prediction_id);
                });

            migrationBuilder.CreateTable(
                name: "social_donation_predictions",
                columns: table => new
                {
                    prediction_id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    post_id = table.Column<int>(type: "integer", nullable: false),
                    as_of_date = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    predicted_donation_value_php = table.Column<double>(type: "double precision", nullable: false),
                    p_high_conversion = table.Column<double>(type: "double precision", nullable: true),
                    model_version = table.Column<string>(type: "text", nullable: false),
                    scored_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_social_donation_predictions", x => x.prediction_id);
                });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "donor_retention_predictions");

            migrationBuilder.DropTable(
                name: "incident_risk_predictions");

            migrationBuilder.DropTable(
                name: "resident_progress_predictions");

            migrationBuilder.DropTable(
                name: "social_donation_predictions");
        }
    }
}
