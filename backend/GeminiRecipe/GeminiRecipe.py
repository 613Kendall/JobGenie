from pydantic import BaseModel, Field
class Recipe(BaseModel):
   strengths: list[str]
   improvements: list[str]
   rating: int = Field(ge=0, le=10)  # Rating between 0 and 10
   next_steps: list[str]