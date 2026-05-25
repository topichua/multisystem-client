export const SpacingDefinition = {
  none: 0,
  ultraTight: 2,
  extraTight: 4,
  medium: 6,
  tight: 8,
  normal: 12,
  loose: 16,
  extraLoose: 24,
  ultraLoose: 32,
} as const;

export const spacingDefinition = {
  none: `${SpacingDefinition.none}`,
  ultraTight: `${SpacingDefinition.ultraTight}px`,
  extraTight: `${SpacingDefinition.extraTight}px`,
  medium: `${SpacingDefinition.medium}px`,
  tight: `${SpacingDefinition.tight}px`,
  normal: `${SpacingDefinition.normal}px`,
  loose: `${SpacingDefinition.loose}px`,
  extraLoose: `${SpacingDefinition.extraLoose}px`,
  ultraLoose: `${SpacingDefinition.ultraLoose}px`,
} as const;

export type Spacing = keyof typeof spacingDefinition;

const keys = Object.keys(spacingDefinition) as Spacing[];

export const spacingDefinitionNames = keys.reduce(
  (prev, next) => {
    return {
      ...prev,
      [next]: next,
    };
  },
  {} as { [key in Spacing]: Spacing },
);

export const spacingDefinitionNumbers = {
  [spacingDefinitionNames.none]: SpacingDefinition.none,
  [spacingDefinitionNames.ultraTight]: SpacingDefinition.ultraTight,
  [spacingDefinitionNames.extraTight]: SpacingDefinition.extraTight,
  [spacingDefinitionNames.tight]: SpacingDefinition.tight,
  [spacingDefinitionNames.normal]: SpacingDefinition.normal,
  [spacingDefinitionNames.loose]: SpacingDefinition.loose,
  [spacingDefinitionNames.extraLoose]: SpacingDefinition.extraLoose,
};
