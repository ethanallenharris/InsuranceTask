"""
Data repository for health insurance data.
Abstraction layer for data storage - currently in-memory, easily replaceable with SQL.
"""

from typing import Optional
from health_insurance.models import UserProfile, EligibilityResult


class InMemoryRepository:
    """
    In-memory data storage.
    Replace with SQLRepository when ready to add database support.
    """
    
    def __init__(self):
        self._profiles = {}
        self._results = {}
        self._next_id = 1
    
    def save_profile(self, profile: UserProfile) -> int:
        """Save a user profile and return its ID."""
        profile_id = self._next_id
        self._next_id += 1
        self._profiles[profile_id] = profile
        return profile_id
    
    def get_profile(self, profile_id: int) -> Optional[UserProfile]:
        """Retrieve a user profile by ID."""
        return self._profiles.get(profile_id)
    
    def save_result(self, profile_id: int, result: EligibilityResult) -> None:
        """Save an eligibility result linked to a profile."""
        self._results[profile_id] = result
    
    def get_result(self, profile_id: int) -> Optional[EligibilityResult]:
        """Retrieve an eligibility result by profile ID."""
        return self._results.get(profile_id)
    
    def get_all_profiles(self) -> list:
        """Get all stored profiles."""
        return list(self._profiles.items())


# Singleton instance for the application
repository = InMemoryRepository()
