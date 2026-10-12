"""
Health insurance eligibility questionnaire.
Command-line interface for collecting user information.
"""

from health_insurance.models import UserProfile
from health_insurance.eligibility import determine_eligibility
from health_insurance.repository import repository


EMPLOYMENT_OPTIONS = [
    "employed_full_time",
    "employed_part_time",
    "self_employed",
    "unemployed",
    "retired",
    "student"
]

US_STATES = [
    "AL", "AK", "AZ", "AR", "CA", "CO", "CT", "DE", "FL", "GA",
    "HI", "ID", "IL", "IN", "IA", "KS", "KY", "LA", "ME", "MD",
    "MA", "MI", "MN", "MS", "MO", "MT", "NE", "NV", "NH", "NJ",
    "NM", "NY", "NC", "ND", "OH", "OK", "OR", "PA", "RI", "SC",
    "SD", "TN", "TX", "UT", "VT", "VA", "WA", "WV", "WI", "WY", "DC"
]


def get_integer_input(prompt: str, min_val: int = None, max_val: int = None) -> int:
    """Get validated integer input from user."""
    while True:
        try:
            value = int(input(prompt))
            if min_val is not None and value < min_val:
                print(f"Please enter a value of at least {min_val}.")
                continue
            if max_val is not None and value > max_val:
                print(f"Please enter a value no greater than {max_val}.")
                continue
            return value
        except ValueError:
            print("Please enter a valid number.")


def get_float_input(prompt: str, min_val: float = None) -> float:
    """Get validated float input from user."""
    while True:
        try:
            value = float(input(prompt))
            if min_val is not None and value < min_val:
                print(f"Please enter a value of at least {min_val}.")
                continue
            return value
        except ValueError:
            print("Please enter a valid number.")


def get_yes_no_input(prompt: str) -> bool:
    """Get yes/no input from user."""
    while True:
        response = input(prompt).strip().lower()
        if response in ["y", "yes"]:
            return True
        elif response in ["n", "no"]:
            return False
        else:
            print("Please enter 'yes' or 'no' (y/n).")


def get_choice_input(prompt: str, options: list) -> str:
    """Get choice from a list of options."""
    print(prompt)
    for i, option in enumerate(options, 1):
        print(f"  {i}. {option.replace('_', ' ').title()}")
    
    while True:
        try:
            choice = int(input("Enter your choice (number): "))
            if 1 <= choice <= len(options):
                return options[choice - 1]
            print(f"Please enter a number between 1 and {len(options)}.")
        except ValueError:
            print("Please enter a valid number.")


def get_state_input() -> str:
    """Get US state input from user."""
    while True:
        state = input("Enter your state (2-letter code, e.g., CA): ").strip().upper()
        if state in US_STATES:
            return state
        print("Please enter a valid US state code.")


def collect_user_information() -> UserProfile:
    """Collect all user information through the questionnaire."""
    print("\n" + "=" * 60)
    print("HEALTH INSURANCE ELIGIBILITY QUESTIONNAIRE")
    print("=" * 60)
    print("\nPlease answer the following questions to determine your")
    print("health insurance eligibility and available plans.\n")
    
    # Personal Information
    print("-" * 40)
    print("PERSONAL INFORMATION")
    print("-" * 40)
    
    age = get_integer_input("What is your age? ", min_val=0, max_val=120)
    state = get_state_input()
    
    # Household Information
    print("\n" + "-" * 40)
    print("HOUSEHOLD INFORMATION")
    print("-" * 40)
    
    household_size = get_integer_input(
        "How many people are in your household (including yourself)? ",
        min_val=1,
        max_val=20
    )
    annual_income = get_float_input(
        "What is your total annual household income? $",
        min_val=0
    )
    
    # Employment Information
    print("\n" + "-" * 40)
    print("EMPLOYMENT INFORMATION")
    print("-" * 40)
    
    employment_status = get_choice_input(
        "What is your current employment status?",
        EMPLOYMENT_OPTIONS
    )
    
    # Health Information
    print("\n" + "-" * 40)
    print("HEALTH INFORMATION")
    print("-" * 40)
    
    has_preexisting_conditions = get_yes_no_input(
        "Do you have any pre-existing health conditions? (y/n): "
    )
    is_smoker = get_yes_no_input("Do you currently use tobacco products? (y/n): ")
    
    # Current Coverage
    print("\n" + "-" * 40)
    print("CURRENT COVERAGE")
    print("-" * 40)
    
    currently_insured = get_yes_no_input(
        "Do you currently have health insurance? (y/n): "
    )
    
    return UserProfile(
        age=age,
        annual_income=annual_income,
        employment_status=employment_status,
        household_size=household_size,
        has_preexisting_conditions=has_preexisting_conditions,
        is_smoker=is_smoker,
        state=state,
        currently_insured=currently_insured
    )


def display_results(result) -> None:
    """Display eligibility results to the user."""
    print("\n" + "=" * 60)
    print("YOUR ELIGIBILITY RESULTS")
    print("=" * 60)
    
    # Government Programs
    print("\n" + "-" * 40)
    print("GOVERNMENT PROGRAM ELIGIBILITY")
    print("-" * 40)
    
    if result.medicare_eligible:
        print("✓ You appear to be eligible for MEDICARE")
        print("  Contact Social Security Administration to enroll.")
    
    if result.medicaid_eligible:
        print("✓ You may be eligible for MEDICAID")
        print("  Contact your state Medicaid office for more information.")
    
    if not result.medicare_eligible and not result.medicaid_eligible:
        print("You do not appear to qualify for Medicare or Medicaid.")
    
    # Subsidies
    print("\n" + "-" * 40)
    print("PREMIUM SUBSIDY INFORMATION")
    print("-" * 40)
    
    if result.subsidy_eligible:
        print(f"✓ You may be eligible for premium subsidies!")
        print(f"  Estimated monthly subsidy: ${result.estimated_subsidy:.2f}")
    else:
        print("You do not appear to qualify for premium subsidies.")
    
    # Available Plans
    print("\n" + "-" * 40)
    print("AVAILABLE INSURANCE PLANS")
    print("-" * 40)
    
    if result.eligible_plans:
        for plan in result.eligible_plans:
            print(f"\n{plan.name} ({plan.plan_type})")
            print(f"  Monthly Premium: ${plan.monthly_premium:.2f}")
            if result.subsidy_eligible:
                adjusted = max(0, plan.monthly_premium - result.estimated_subsidy)
                print(f"  After Subsidy:   ${adjusted:.2f}")
            print(f"  Deductible: ${plan.deductible:.2f}")
            print(f"  Coverage Level: {plan.coverage_level}")
            print(f"  {plan.description}")
    else:
        print("No marketplace plans available based on your information.")
    
    print("\n" + "=" * 60)
    print("DISCLAIMER: This is an estimate only. Actual eligibility")
    print("and costs may vary. Please visit healthcare.gov or contact")
    print("a licensed insurance agent for official information.")
    print("=" * 60 + "\n")


def run_questionnaire() -> None:
    """Main function to run the eligibility questionnaire."""
    try:
        # Collect user information
        profile = collect_user_information()
        
        # Save profile to repository
        profile_id = repository.save_profile(profile)
        
        # Determine eligibility
        result = determine_eligibility(profile)
        
        # Save result to repository
        repository.save_result(profile_id, result)
        
        # Display results
        display_results(result)
        
        print(f"Your session ID: {profile_id}")
        print("Your information has been saved for future reference.\n")
        
    except KeyboardInterrupt:
        print("\n\nQuestionnaire cancelled. No information was saved.")


if __name__ == "__main__":
    run_questionnaire()
