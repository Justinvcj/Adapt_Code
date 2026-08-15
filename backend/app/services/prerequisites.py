# Component 3: The Concept Prerequisite Graph
# A structured map of the 12 programming concepts and their prerequisite dependencies.
# The routing agent uses this as a hard constraint.

PREREQUISITE_GRAPH = {
    'basic_syntax':        [],
    'loops':               ['basic_syntax'],
    'arrays':              ['loops'],
    'strings':             ['arrays'],
    'hashing':             ['arrays'],
    'two_pointers':        ['arrays'],
    'sliding_window':      ['two_pointers'],
    'recursion':           ['loops'],
    'backtracking':        ['recursion'],
    'binary_search':       ['arrays', 'loops'],
    'trees':               ['recursion'],
    'dynamic_programming': ['recursion']
}

def get_weakest_unmastered_prerequisite(concept: str, mastery_dict: dict, threshold: float = 0.85):
    """
    Given a target concept and the student's mastery dictionary, returns the prerequisite 
    concept that has the lowest mastery score below the threshold.
    Returns None if all prerequisites are mastered.
    """
    prereqs = PREREQUISITE_GRAPH.get(concept, [])
    if not prereqs:
        return None
        
    weakest_prereq = None
    lowest_score = float('inf')
    
    for req in prereqs:
        score = mastery_dict.get(req, 0.0)
        if score < threshold and score < lowest_score:
            lowest_score = score
            weakest_prereq = req
            
    return weakest_prereq

def can_access_concept(concept: str, mastery_dict: dict, threshold: float = 0.85) -> bool:
    """
    Returns True if all prerequisites for the given concept are mastered.
    """
    return get_weakest_unmastered_prerequisite(concept, mastery_dict, threshold) is None
