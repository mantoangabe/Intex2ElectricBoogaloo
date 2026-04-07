using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace backend.Migrations
{
    /// <inheritdoc />
    public partial class InitialCreate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "donation_allocations",
                columns: table => new
                {
                    allocation_id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    donation_id = table.Column<int>(type: "integer", nullable: false),
                    safehouse_id = table.Column<int>(type: "integer", nullable: false),
                    program_area = table.Column<string>(type: "text", nullable: false),
                    amount_allocated = table.Column<decimal>(type: "numeric", nullable: false),
                    allocation_date = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    allocation_notes = table.Column<string>(type: "text", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_donation_allocations", x => x.allocation_id);
                });

            migrationBuilder.CreateTable(
                name: "donations",
                columns: table => new
                {
                    donation_id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    supporter_id = table.Column<int>(type: "integer", nullable: false),
                    donation_type = table.Column<string>(type: "text", nullable: false),
                    donation_date = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    is_recurring = table.Column<bool>(type: "boolean", nullable: false),
                    campaign_name = table.Column<string>(type: "text", nullable: true),
                    channel_source = table.Column<string>(type: "text", nullable: false),
                    currency_code = table.Column<string>(type: "text", nullable: true),
                    amount = table.Column<decimal>(type: "numeric", nullable: true),
                    estimated_value = table.Column<decimal>(type: "numeric", nullable: true),
                    impact_unit = table.Column<string>(type: "text", nullable: false),
                    notes = table.Column<string>(type: "text", nullable: true),
                    created_by_partner_id = table.Column<int>(type: "integer", nullable: true),
                    referral_post_id = table.Column<int>(type: "integer", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_donations", x => x.donation_id);
                });

            migrationBuilder.CreateTable(
                name: "education_records",
                columns: table => new
                {
                    education_record_id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    resident_id = table.Column<int>(type: "integer", nullable: false),
                    record_date = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    education_level = table.Column<string>(type: "text", nullable: false),
                    school_name = table.Column<string>(type: "text", nullable: false),
                    enrollment_status = table.Column<string>(type: "text", nullable: false),
                    attendance_rate = table.Column<decimal>(type: "numeric", nullable: true),
                    progress_percent = table.Column<decimal>(type: "numeric", nullable: true),
                    completion_status = table.Column<string>(type: "text", nullable: false),
                    notes = table.Column<string>(type: "text", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_education_records", x => x.education_record_id);
                });

            migrationBuilder.CreateTable(
                name: "health_wellbeing_records",
                columns: table => new
                {
                    health_record_id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    resident_id = table.Column<int>(type: "integer", nullable: false),
                    record_date = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    general_health_score = table.Column<decimal>(type: "numeric", nullable: true),
                    nutrition_score = table.Column<decimal>(type: "numeric", nullable: true),
                    sleep_quality_score = table.Column<decimal>(type: "numeric", nullable: true),
                    energy_level_score = table.Column<decimal>(type: "numeric", nullable: true),
                    height_cm = table.Column<decimal>(type: "numeric", nullable: true),
                    weight_kg = table.Column<decimal>(type: "numeric", nullable: true),
                    bmi = table.Column<decimal>(type: "numeric", nullable: true),
                    medical_checkup_done = table.Column<bool>(type: "boolean", nullable: false),
                    dental_checkup_done = table.Column<bool>(type: "boolean", nullable: false),
                    psychological_checkup_done = table.Column<bool>(type: "boolean", nullable: false),
                    notes = table.Column<string>(type: "text", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_health_wellbeing_records", x => x.health_record_id);
                });

            migrationBuilder.CreateTable(
                name: "home_visitations",
                columns: table => new
                {
                    visitation_id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    resident_id = table.Column<int>(type: "integer", nullable: false),
                    visit_date = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    social_worker = table.Column<string>(type: "text", nullable: false),
                    visit_type = table.Column<string>(type: "text", nullable: false),
                    location_visited = table.Column<string>(type: "text", nullable: false),
                    family_members_present = table.Column<string>(type: "text", nullable: false),
                    purpose = table.Column<string>(type: "text", nullable: false),
                    observations = table.Column<string>(type: "text", nullable: false),
                    family_cooperation_level = table.Column<string>(type: "text", nullable: false),
                    safety_concerns_noted = table.Column<bool>(type: "boolean", nullable: false),
                    follow_up_needed = table.Column<bool>(type: "boolean", nullable: false),
                    follow_up_notes = table.Column<string>(type: "text", nullable: true),
                    visit_outcome = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_home_visitations", x => x.visitation_id);
                });

            migrationBuilder.CreateTable(
                name: "in_kind_donation_items",
                columns: table => new
                {
                    item_id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    donation_id = table.Column<int>(type: "integer", nullable: false),
                    item_name = table.Column<string>(type: "text", nullable: false),
                    item_category = table.Column<string>(type: "text", nullable: false),
                    quantity = table.Column<int>(type: "integer", nullable: false),
                    unit_of_measure = table.Column<string>(type: "text", nullable: false),
                    estimated_unit_value = table.Column<decimal>(type: "numeric", nullable: false),
                    intended_use = table.Column<string>(type: "text", nullable: false),
                    received_condition = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_in_kind_donation_items", x => x.item_id);
                });

            migrationBuilder.CreateTable(
                name: "incident_reports",
                columns: table => new
                {
                    incident_id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    resident_id = table.Column<int>(type: "integer", nullable: false),
                    safehouse_id = table.Column<int>(type: "integer", nullable: false),
                    incident_date = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    incident_type = table.Column<string>(type: "text", nullable: false),
                    severity = table.Column<string>(type: "text", nullable: false),
                    description = table.Column<string>(type: "text", nullable: false),
                    response_taken = table.Column<string>(type: "text", nullable: false),
                    resolved = table.Column<bool>(type: "boolean", nullable: false),
                    resolution_date = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    reported_by = table.Column<string>(type: "text", nullable: false),
                    follow_up_required = table.Column<bool>(type: "boolean", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_incident_reports", x => x.incident_id);
                });

            migrationBuilder.CreateTable(
                name: "intervention_plans",
                columns: table => new
                {
                    plan_id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    resident_id = table.Column<int>(type: "integer", nullable: false),
                    plan_category = table.Column<string>(type: "text", nullable: false),
                    plan_description = table.Column<string>(type: "text", nullable: false),
                    services_provided = table.Column<string>(type: "text", nullable: false),
                    target_value = table.Column<decimal>(type: "numeric", nullable: true),
                    target_date = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    status = table.Column<string>(type: "text", nullable: false),
                    case_conference_date = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_intervention_plans", x => x.plan_id);
                });

            migrationBuilder.CreateTable(
                name: "partner_assignments",
                columns: table => new
                {
                    assignment_id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    partner_id = table.Column<int>(type: "integer", nullable: false),
                    safehouse_id = table.Column<decimal>(type: "numeric", nullable: true),
                    program_area = table.Column<string>(type: "text", nullable: false),
                    assignment_start = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    assignment_end = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    responsibility_notes = table.Column<string>(type: "text", nullable: true),
                    is_primary = table.Column<bool>(type: "boolean", nullable: false),
                    status = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_partner_assignments", x => x.assignment_id);
                });

            migrationBuilder.CreateTable(
                name: "partners",
                columns: table => new
                {
                    partner_id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    partner_name = table.Column<string>(type: "text", nullable: false),
                    partner_type = table.Column<string>(type: "text", nullable: false),
                    role_type = table.Column<string>(type: "text", nullable: false),
                    contact_name = table.Column<string>(type: "text", nullable: false),
                    email = table.Column<string>(type: "text", nullable: false),
                    phone = table.Column<string>(type: "text", nullable: false),
                    region = table.Column<string>(type: "text", nullable: false),
                    status = table.Column<string>(type: "text", nullable: false),
                    start_date = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    end_date = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    notes = table.Column<string>(type: "text", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_partners", x => x.partner_id);
                });

            migrationBuilder.CreateTable(
                name: "process_recordings",
                columns: table => new
                {
                    recording_id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    resident_id = table.Column<int>(type: "integer", nullable: false),
                    session_date = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    social_worker = table.Column<string>(type: "text", nullable: false),
                    session_type = table.Column<string>(type: "text", nullable: false),
                    session_duration_minutes = table.Column<int>(type: "integer", nullable: false),
                    emotional_state_observed = table.Column<string>(type: "text", nullable: false),
                    emotional_state_end = table.Column<string>(type: "text", nullable: false),
                    session_narrative = table.Column<string>(type: "text", nullable: false),
                    interventions_applied = table.Column<string>(type: "text", nullable: false),
                    follow_up_actions = table.Column<string>(type: "text", nullable: false),
                    progress_noted = table.Column<bool>(type: "boolean", nullable: false),
                    concerns_flagged = table.Column<bool>(type: "boolean", nullable: false),
                    referral_made = table.Column<bool>(type: "boolean", nullable: false),
                    notes_restricted = table.Column<string>(type: "text", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_process_recordings", x => x.recording_id);
                });

            migrationBuilder.CreateTable(
                name: "public_impact_snapshots",
                columns: table => new
                {
                    snapshot_id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    snapshot_date = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    headline = table.Column<string>(type: "text", nullable: false),
                    summary_text = table.Column<string>(type: "text", nullable: false),
                    metric_payload_json = table.Column<string>(type: "text", nullable: false),
                    is_published = table.Column<bool>(type: "boolean", nullable: false),
                    published_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_public_impact_snapshots", x => x.snapshot_id);
                });

            migrationBuilder.CreateTable(
                name: "residents",
                columns: table => new
                {
                    resident_id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    case_control_no = table.Column<string>(type: "text", nullable: false),
                    internal_code = table.Column<string>(type: "text", nullable: false),
                    safehouse_id = table.Column<int>(type: "integer", nullable: false),
                    case_status = table.Column<string>(type: "text", nullable: false),
                    sex = table.Column<string>(type: "text", nullable: false),
                    date_of_birth = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    birth_status = table.Column<string>(type: "text", nullable: false),
                    place_of_birth = table.Column<string>(type: "text", nullable: false),
                    religion = table.Column<string>(type: "text", nullable: false),
                    case_category = table.Column<string>(type: "text", nullable: false),
                    sub_cat_orphaned = table.Column<bool>(type: "boolean", nullable: false),
                    sub_cat_trafficked = table.Column<bool>(type: "boolean", nullable: false),
                    sub_cat_child_labor = table.Column<bool>(type: "boolean", nullable: false),
                    sub_cat_physical_abuse = table.Column<bool>(type: "boolean", nullable: false),
                    sub_cat_sexual_abuse = table.Column<bool>(type: "boolean", nullable: false),
                    sub_cat_osaec = table.Column<bool>(type: "boolean", nullable: false),
                    sub_cat_cicl = table.Column<bool>(type: "boolean", nullable: false),
                    sub_cat_at_risk = table.Column<bool>(type: "boolean", nullable: false),
                    sub_cat_street_child = table.Column<bool>(type: "boolean", nullable: false),
                    sub_cat_child_with_hiv = table.Column<bool>(type: "boolean", nullable: false),
                    is_pwd = table.Column<bool>(type: "boolean", nullable: false),
                    pwd_type = table.Column<string>(type: "text", nullable: true),
                    has_special_needs = table.Column<bool>(type: "boolean", nullable: false),
                    special_needs_diagnosis = table.Column<string>(type: "text", nullable: true),
                    family_is_4ps = table.Column<bool>(type: "boolean", nullable: false),
                    family_solo_parent = table.Column<bool>(type: "boolean", nullable: false),
                    family_indigenous = table.Column<bool>(type: "boolean", nullable: false),
                    family_parent_pwd = table.Column<bool>(type: "boolean", nullable: false),
                    family_informal_settler = table.Column<bool>(type: "boolean", nullable: false),
                    date_of_admission = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    age_upon_admission = table.Column<string>(type: "text", nullable: false),
                    present_age = table.Column<string>(type: "text", nullable: false),
                    length_of_stay = table.Column<string>(type: "text", nullable: false),
                    referral_source = table.Column<string>(type: "text", nullable: false),
                    referring_agency_person = table.Column<string>(type: "text", nullable: false),
                    date_colb_registered = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    date_colb_obtained = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    assigned_social_worker = table.Column<string>(type: "text", nullable: false),
                    initial_case_assessment = table.Column<string>(type: "text", nullable: false),
                    date_case_study_prepared = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    reintegration_type = table.Column<string>(type: "text", nullable: true),
                    reintegration_status = table.Column<string>(type: "text", nullable: true),
                    initial_risk_level = table.Column<string>(type: "text", nullable: false),
                    current_risk_level = table.Column<string>(type: "text", nullable: false),
                    date_enrolled = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    date_closed = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    notes_restricted = table.Column<string>(type: "text", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_residents", x => x.resident_id);
                });

            migrationBuilder.CreateTable(
                name: "safehouse_monthly_metrics",
                columns: table => new
                {
                    metric_id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    safehouse_id = table.Column<int>(type: "integer", nullable: false),
                    month_start = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    month_end = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    active_residents = table.Column<int>(type: "integer", nullable: false),
                    avg_education_progress = table.Column<decimal>(type: "numeric", nullable: true),
                    avg_health_score = table.Column<decimal>(type: "numeric", nullable: true),
                    process_recording_count = table.Column<int>(type: "integer", nullable: false),
                    home_visitation_count = table.Column<int>(type: "integer", nullable: false),
                    incident_count = table.Column<int>(type: "integer", nullable: false),
                    notes = table.Column<string>(type: "text", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_safehouse_monthly_metrics", x => x.metric_id);
                });

            migrationBuilder.CreateTable(
                name: "safehouses",
                columns: table => new
                {
                    safehouse_id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    safehouse_code = table.Column<string>(type: "text", nullable: false),
                    name = table.Column<string>(type: "text", nullable: false),
                    region = table.Column<string>(type: "text", nullable: false),
                    city = table.Column<string>(type: "text", nullable: false),
                    province = table.Column<string>(type: "text", nullable: false),
                    country = table.Column<string>(type: "text", nullable: false),
                    open_date = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    status = table.Column<string>(type: "text", nullable: false),
                    capacity_girls = table.Column<int>(type: "integer", nullable: false),
                    capacity_staff = table.Column<int>(type: "integer", nullable: false),
                    current_occupancy = table.Column<int>(type: "integer", nullable: false),
                    notes = table.Column<string>(type: "text", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_safehouses", x => x.safehouse_id);
                });

            migrationBuilder.CreateTable(
                name: "social_media_posts",
                columns: table => new
                {
                    post_id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    platform = table.Column<string>(type: "text", nullable: false),
                    platform_post_id = table.Column<string>(type: "text", nullable: false),
                    post_url = table.Column<string>(type: "text", nullable: false),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    day_of_week = table.Column<string>(type: "text", nullable: false),
                    post_hour = table.Column<int>(type: "integer", nullable: false),
                    post_type = table.Column<string>(type: "text", nullable: false),
                    media_type = table.Column<string>(type: "text", nullable: false),
                    caption = table.Column<string>(type: "text", nullable: false),
                    hashtags = table.Column<string>(type: "text", nullable: true),
                    num_hashtags = table.Column<int>(type: "integer", nullable: false),
                    mentions_count = table.Column<int>(type: "integer", nullable: false),
                    has_call_to_action = table.Column<bool>(type: "boolean", nullable: false),
                    call_to_action_type = table.Column<string>(type: "text", nullable: true),
                    content_topic = table.Column<string>(type: "text", nullable: false),
                    sentiment_tone = table.Column<string>(type: "text", nullable: false),
                    caption_length = table.Column<int>(type: "integer", nullable: false),
                    features_resident_story = table.Column<bool>(type: "boolean", nullable: false),
                    campaign_name = table.Column<string>(type: "text", nullable: true),
                    is_boosted = table.Column<bool>(type: "boolean", nullable: false),
                    boost_budget_php = table.Column<decimal>(type: "numeric", nullable: true),
                    impressions = table.Column<int>(type: "integer", nullable: false),
                    reach = table.Column<int>(type: "integer", nullable: false),
                    likes = table.Column<int>(type: "integer", nullable: false),
                    comments = table.Column<int>(type: "integer", nullable: false),
                    shares = table.Column<int>(type: "integer", nullable: false),
                    saves = table.Column<int>(type: "integer", nullable: false),
                    click_throughs = table.Column<int>(type: "integer", nullable: false),
                    video_views = table.Column<int>(type: "integer", nullable: true),
                    engagement_rate = table.Column<decimal>(type: "numeric", nullable: true),
                    profile_visits = table.Column<int>(type: "integer", nullable: true),
                    donation_referrals = table.Column<int>(type: "integer", nullable: true),
                    estimated_donation_value_php = table.Column<decimal>(type: "numeric", nullable: true),
                    follower_count_at_post = table.Column<int>(type: "integer", nullable: true),
                    watch_time_seconds = table.Column<int>(type: "integer", nullable: true),
                    avg_view_duration_seconds = table.Column<int>(type: "integer", nullable: true),
                    subscriber_count_at_post = table.Column<int>(type: "integer", nullable: true),
                    forwards = table.Column<decimal>(type: "numeric", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_social_media_posts", x => x.post_id);
                });

            migrationBuilder.CreateTable(
                name: "supporters",
                columns: table => new
                {
                    supporter_id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    supporter_type = table.Column<string>(type: "text", nullable: false),
                    display_name = table.Column<string>(type: "text", nullable: false),
                    organization_name = table.Column<string>(type: "text", nullable: true),
                    first_name = table.Column<string>(type: "text", nullable: true),
                    last_name = table.Column<string>(type: "text", nullable: true),
                    relationship_type = table.Column<string>(type: "text", nullable: false),
                    region = table.Column<string>(type: "text", nullable: false),
                    country = table.Column<string>(type: "text", nullable: false),
                    email = table.Column<string>(type: "text", nullable: false),
                    phone = table.Column<string>(type: "text", nullable: false),
                    status = table.Column<string>(type: "text", nullable: false),
                    first_donation_date = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    acquisition_channel = table.Column<string>(type: "text", nullable: false),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_supporters", x => x.supporter_id);
                });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "donation_allocations");

            migrationBuilder.DropTable(
                name: "donations");

            migrationBuilder.DropTable(
                name: "education_records");

            migrationBuilder.DropTable(
                name: "health_wellbeing_records");

            migrationBuilder.DropTable(
                name: "home_visitations");

            migrationBuilder.DropTable(
                name: "in_kind_donation_items");

            migrationBuilder.DropTable(
                name: "incident_reports");

            migrationBuilder.DropTable(
                name: "intervention_plans");

            migrationBuilder.DropTable(
                name: "partner_assignments");

            migrationBuilder.DropTable(
                name: "partners");

            migrationBuilder.DropTable(
                name: "process_recordings");

            migrationBuilder.DropTable(
                name: "public_impact_snapshots");

            migrationBuilder.DropTable(
                name: "residents");

            migrationBuilder.DropTable(
                name: "safehouse_monthly_metrics");

            migrationBuilder.DropTable(
                name: "safehouses");

            migrationBuilder.DropTable(
                name: "social_media_posts");

            migrationBuilder.DropTable(
                name: "supporters");
        }
    }
}
