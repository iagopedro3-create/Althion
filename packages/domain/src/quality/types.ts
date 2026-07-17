export interface QualityCriterion {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly maxScore: number; // typically 5
}

export interface QualityRubric {
  readonly version: string; // semver format, e.g., '1.0.0-provisional'
  readonly title: string;
  readonly description: string;
  readonly criteria: readonly QualityCriterion[];
  readonly isActive: boolean;
  readonly createdBy: string;
  readonly createdAt: Date;
}

export interface QualityEvaluation {
  readonly id: string;
  readonly organizationId: string;
  readonly clinicId: string;
  readonly conversationId: string;
  readonly evaluatorId: string;
  readonly rubricVersion: string;
  readonly scores: Readonly<Record<string, number>>; // criterionId -> score (0 to maxScore)
  readonly totalScore: number; // calculated 0 to 100
  readonly feedback?: string;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}

export type ClinicalFlagStatus = 'pending' | 'transferred' | 'resolved';

export interface QualityClinicalFlag {
  readonly id: string;
  readonly organizationId: string;
  readonly clinicId: string;
  readonly conversationId: string;
  readonly flaggedAt: Date;
  readonly flaggedByProfileId: string | null; // null if automated
  readonly flagReason: string;
  readonly status: ClinicalFlagStatus;
  readonly resolvedAt?: Date | null;
  readonly resolvedByProfileId?: string | null;
  readonly handoffNotes?: string | null;
}
