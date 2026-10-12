"""
Main entry point for the health insurance eligibility application.
"""

from health_insurance.questionnaire import run_questionnaire


def main():
    """Run the health insurance eligibility questionnaire."""
    print("\nWelcome to the Health Insurance Eligibility Tool")
    print("This tool will help you find insurance plans you may qualify for.\n")
    
    while True:
        run_questionnaire()
        
        again = input("Would you like to check eligibility for another person? (y/n): ")
        if again.lower() not in ["y", "yes"]:
            print("\nThank you for using the Health Insurance Eligibility Tool!")
            print("Goodbye!\n")
            break


if __name__ == "__main__":
    main()
