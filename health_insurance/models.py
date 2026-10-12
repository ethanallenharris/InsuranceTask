"""
Data models for health insurance eligibility.
Structured for easy addition of type verification (Pydantic) and SQL ORM (SQLAlchemy).
"""

class UserProfile:
    """Represents user information for insurance eligibility."""
    
    def __init__(
        self,
        age: int = None,
        annual_income: float = None,
        employment_status: str = None,
        household_size: int = None,
        has_preexisting_conditions: bool = None,
        is_smoker: bool = None,
        state: str = None,
        currently_insured: bool = None
    ):
        self.age = age
        self.annual_income = annual_income
        self.employment_status = employment_status
        self.household_size = household_size
        self.has_preexisting_conditions = has_preexisting_conditions
        self.is_smoker = is_smoker
        self.state = state
        self.currently_insured = currently_insured
    
    def to_dict(self) -> dict:
        """Convert profile to dictionary for storage."""
        return {
            "age": self.age,
            "annual_income": self.annual_income,
            "employment_status": self.employment_status,
            "household_size": self.household_size,
            "has_preexisting_conditions": self.has_preexisting_conditions,
            "is_smoker": self.is_smoker,
            "state": self.state,
            "currently_insured": self.currently_insured
        }
    
    @classmethod
    def from_dict(cls, data: dict) -> "UserProfile":
        """Create profile from dictionary."""
        return cls(**data)


class InsurancePlan:
    """Represents an available insurance plan."""
    
    def __init__(
        self,
        plan_id: str,
        name: str,
        plan_type: str,
        monthly_premium: float,
        deductible: float,
        coverage_level: str,
        description: str
    ):
        self.plan_id = plan_id
        self.name = name
        self.plan_type = plan_type
        self.monthly_premium = monthly_premium
        self.deductible = deductible
        self.coverage_level = coverage_level
        self.description = description
    
    def to_dict(self) -> dict:
        """Convert plan to dictionary."""
        return {
            "plan_id": self.plan_id,
            "name": self.name,
            "plan_type": self.plan_type,
            "monthly_premium": self.monthly_premium,
            "deductible": self.deductible,
            "coverage_level": self.coverage_level,
            "description": self.description
        }


class EligibilityResult:
    """Represents the result of an eligibility check."""
    
    def __init__(
        self,
        user_profile: UserProfile,
        eligible_plans: list,
        subsidy_eligible: bool = False,
        estimated_subsidy: float = 0.0,
        medicaid_eligible: bool = False,
        medicare_eligible: bool = False
    ):
        self.user_profile = user_profile
        self.eligible_plans = eligible_plans
        self.subsidy_eligible = subsidy_eligible
        self.estimated_subsidy = estimated_subsidy
        self.medicaid_eligible = medicaid_eligible
        self.medicare_eligible = medicare_eligible
    
    def to_dict(self) -> dict:
        """Convert result to dictionary for storage."""
        return {
            "user_profile": self.user_profile.to_dict(),
            "eligible_plans": [p.to_dict() for p in self.eligible_plans],
            "subsidy_eligible": self.subsidy_eligible,
            "estimated_subsidy": self.estimated_subsidy,
            "medicaid_eligible": self.medicaid_eligible,
            "medicare_eligible": self.medicare_eligible
        }
