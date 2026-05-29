export type AuthUser = {
  authenticated: boolean;
  provider: "entra" | "test";
  username: string;
  displayName: string;
};
