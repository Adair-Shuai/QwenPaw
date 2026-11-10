export interface AvatarChoice {
  id: string;
  label: string;
}

export interface AvatarDomain extends AvatarChoice {
  code: string;
  motif: string;
  roles: (AvatarChoice & { detail: string })[];
}

export const avatarKit: {
  domains: AvatarDomain[];
  shells: AvatarChoice[];
  badges: AvatarChoice[];
  render(options: Record<string, unknown>): string;
};
