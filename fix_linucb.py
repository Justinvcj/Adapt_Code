with open('backend/app/services/linucb.py', 'r') as f:
    content = f.read()

old_load_student = """    def load_student(self, student_id: str, db_row: dict):
        self._init_student(student_id)
        if db_row:
            a_mats = db_row.get('a_matrices')
            b_vecs = db_row.get('b_vectors')
            if a_mats:
                for idx, a in enumerate(a_mats):
                    if idx < len(self.A[student_id]):
                        self.A[student_id][idx] = np.array(a)
            if b_vecs:
                for idx, b in enumerate(b_vecs):
                    if idx < len(self.b[student_id]):
                        self.b[student_id][idx] = np.array(b)"""

new_load_student = """    def load_student(self, student_id: str, db_row: dict):
        self._init_student(student_id)
        if db_row:
            a_mats = db_row.get('a_matrices')
            b_vecs = db_row.get('b_vectors')
            if isinstance(a_mats, dict):
                for k, v in a_mats.items():
                    idx = int(k)
                    if idx < len(self.A[student_id]):
                        self.A[student_id][idx] = np.array(v)
            elif isinstance(a_mats, list):
                for idx, a in enumerate(a_mats):
                    if idx < len(self.A[student_id]):
                        self.A[student_id][idx] = np.array(a)
                        
            if isinstance(b_vecs, dict):
                for k, v in b_vecs.items():
                    idx = int(k)
                    if idx < len(self.b[student_id]):
                        self.b[student_id][idx] = np.array(v)
            elif isinstance(b_vecs, list):
                for idx, b in enumerate(b_vecs):
                    if idx < len(self.b[student_id]):
                        self.b[student_id][idx] = np.array(b)"""

content = content.replace(old_load_student, new_load_student)

with open('backend/app/services/linucb.py', 'w') as f:
    f.write(content)
print("Done fixing linucb.py")
