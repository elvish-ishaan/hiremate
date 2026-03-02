interface Portal {
    id: string;
    title: string;
    description: string;
    role: string;
    skillsRequired: string[];
    candidates: string[];
    jobType: string;
    department: string;
    isOpen: boolean;
    createdAt: string;
    updatedAt: string;
    organization: {
        id: string;
        name: string;
        logo: string | null;
    };
    _count?: {
        applicants: number;
    };
}

interface Candidate {
    id: string;
    name: string;
    email: string;
    phone: string | null;
    linkedIn: string | null;
    coverLetter: string | null;
    resumeUrl: string;
    createdAt: string;
}
