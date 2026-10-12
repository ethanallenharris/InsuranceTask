"""
Eligibility determination logic for health insurance plans.
"""

from health_insurance.models import UserProfile, InsurancePlan, EligibilityResult


# Federal Poverty Level (FPL) guidelines for 2024 (continental US)
FPL_BASE = 15060
FPL_PER_PERSON = 5380


def calculate_fpl_percentage(annual_income: float, household_size: int) -> float:
    """Calculate income as a percentage of Federal Poverty Level."""
    fpl_threshold = FPL_BASE + (FPL_PER_PERSON * (household_size - 1))
    return (annual_income / fpl_threshold) * 100


def get_available_plans() -> list:
    """
    Get all available insurance plans.
    This would later be replaced with a database query.
    """
    return [
        InsurancePlan(
            plan_id="bronze_basic",
            name="Bronze Basic",
            plan_type="Bronze",
            monthly_premium=250.00,
            deductible=7000.00,
            coverage_level="60%",
            description="Low premium, higher out-of-pocket costs. Good for healthy individuals."
        ),
        InsurancePlan(
            plan_id="silver_standard",
            name="Silver Standard",
            plan_type="Silver",
            monthly_premium=400.00,
            deductible=4500.00,
            coverage_level="70%",
            description="Moderate premium and deductible. Eligible for cost-sharing reductions."
        ),
        InsurancePlan(
            plan_id="gold_plus",
            name="Gold Plus",
            plan_type="Gold",
            monthly_premium=550.00,
            deductible=1500.00,
            coverage_level="80%",
            description="Higher premium, lower out-of-pocket costs. Good for frequent care needs."
        ),
        InsurancePlan(
            plan_id="platinum_premium",
            name="Platinum Premium",
            plan_type="Platinum",
            monthly_premium=700.00,
            deductible=500.00,
            coverage_level="90%",
            description="Highest premium, lowest out-of-pocket costs. Comprehensive coverage."
        ),
        InsurancePlan(
            plan_id="catastrophic",
            name="Catastrophic Coverage",
            plan_type="Catastrophic",
            monthly_premium=150.00,
            deductible=9000.00,
            coverage_level="Catastrophic",
            description="Very low premium, very high deductible. Only for under 30 or hardship exemption."
        )
    ]


def check_medicaid_eligibility(profile: UserProfile) -> bool:
    """Check if user is eligible for Medicaid."""
    fpl_percentage = calculate_fpl_percentage(profile.annual_income, profile.household_size)
    # Medicaid expansion states: eligible if income <= 138% FPL
    # This is simplified; actual rules vary by state
    return fpl_percentage <= 138


def check_medicare_eligibility(profile: UserProfile) -> bool:
    """Check if user is eligible for Medicare."""
    return profile.age >= 65


def calculate_subsidy(profile: UserProfile) -> tuple:
    """
    Calculate if user is eligible for premium subsidies and estimate amount.
    Returns (is_eligible, estimated_monthly_subsidy)
    """
    fpl_percentage = calculate_fpl_percentage(profile.annual_income, profile.household_size)
    
    # Subsidies available for 100-400% FPL (expanded under ARP)
    if 100 <= fpl_percentage <= 400:
        # Simplified subsidy calculation
        if fpl_percentage <= 150:
            subsidy = 400.00
        elif fpl_percentage <= 200:
            subsidy = 300.00
        elif fpl_percentage <= 250:
            subsidy = 200.00
        elif fpl_percentage <= 300:
            subsidy = 100.00
        else:
            subsidy = 50.00
        return True, subsidy
    
    return False, 0.0


def filter_eligible_plans(profile: UserProfile, plans: list) -> list:
    """Filter plans based on user eligibility criteria."""
    eligible = []
    
    for plan in plans:
        # Catastrophic plans only available to under 30 or hardship exemption
        if plan.plan_type == "Catastrophic" and profile.age >= 30:
            continue
        
        eligible.append(plan)
    
    return eligible


def determine_eligibility(profile: UserProfile) -> EligibilityResult:
    """
    Main eligibility determination function.
    Takes a user profile and returns their eligibility results.
    """
    # Check government program eligibility
    medicaid_eligible = check_medicaid_eligibility(profile)
    medicare_eligible = check_medicare_eligibility(profile)
    
    # Get and filter available plans
    all_plans = get_available_plans()
    eligible_plans = filter_eligible_plans(profile, all_plans)
    
    # Calculate subsidy eligibility
    subsidy_eligible, estimated_subsidy = calculate_subsidy(profile)
    
    return EligibilityResult(
        user_profile=profile,
        eligible_plans=eligible_plans,
        subsidy_eligible=subsidy_eligible,
        estimated_subsidy=estimated_subsidy,
        medicaid_eligible=medicaid_eligible,
        medicare_eligible=medicare_eligible
    )
