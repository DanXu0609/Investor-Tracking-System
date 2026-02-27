export interface EB5Stage {
  id: string;
  name: string;
  description: string;
  completed: boolean;
  completedDate?: string;
}

export interface Investor {
  id: string;
  name: string;
  email: string;
  country: string;
  investmentAmount: number;
  dateAdded: string;
  currentStageIndex: number;
  stages: EB5Stage[];
  notes?: string;
}

export const EB5_STAGES_TEMPLATE: Omit<EB5Stage, "completed" | "completedDate">[] = [
  {
    id: "consulting-package",
    name: "Send Consulting Packages to Investor",
    description: "Prepare and send initial consulting materials",
  },
  {
    id: "signed-package",
    name: "Received Signed Package by Investor",
    description: "Investor returns signed documentation",
  },
  {
    id: "verify-accredit",
    name: "Verify Accredit Investor",
    description: "Confirm investor accreditation status",
  },
  {
    id: "wire-instruction",
    name: "Send Wire Instruction",
    description: "Provide wire transfer instructions to investor",
  },
  {
    id: "admin-fee",
    name: "Receive Admin Fee",
    description: "Confirm receipt of administrative fee payment",
  },
  {
    id: "receive-800k",
    name: "Receive 800K",
    description: "Confirm receipt of $800K investment amount",
  },
  {
    id: "upload-prxy",
    name: "Upload Document to PRXY",
    description: "Upload investor documents to PRXY system",
  },
  {
    id: "hc-account",
    name: "Create HC Global Investor Account",
    description: "Set up HC Global account for investor",
  },
  {
    id: "attorney-letter",
    name: "Attorney Support Letter",
    description: "Obtain attorney support documentation",
  },
  {
    id: "written-direction",
    name: "Written Direction",
    description: "Prepare and receive written direction documents",
  },
  {
    id: "fund-release",
    name: "Fund Release",
    description: "Complete final fund release process",
  },
];