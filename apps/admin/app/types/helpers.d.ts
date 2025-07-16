interface Portal {
    id: string;
    title: string;
    description: string;
    role: string;
    skillsRequired: string[];
    candidates: string[];
    jobType: string;
    department: string;
    status: string;
    createdAt: string;
    updatedAt: string;
    organization: {
        id: string;
        name: string;
        logo: string | null;
    };
}