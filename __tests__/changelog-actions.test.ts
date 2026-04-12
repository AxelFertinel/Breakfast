import { beforeEach, describe, expect, it, vi } from "vitest";

const { mockGetUser, mockSadd, mockSmembers, mockDel } = vi.hoisted(() => ({
  mockGetUser: vi.fn(),
  mockSadd: vi.fn(),
  mockSmembers: vi.fn(),
  mockDel: vi.fn(),
}));

vi.mock("@/lib/auth/auth-user", () => ({
  getUser: mockGetUser,
}));

vi.mock("@/lib/redis", () => ({
  redisClient: {
    sadd: mockSadd,
    smembers: mockSmembers,
    del: mockDel,
  },
}));

import {
  dismissChangelogAction,
  getDismissedChangelogs,
  resetDismissedChangelogsAction,
} from "@/features/changelog/changelog.action";

const mockUser = {
  id: "user-123",
  email: "test@example.com",
  name: "Test User",
};

describe("changelog-actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("dismissChangelogAction", () => {
    it("should add slug to dismissed set when user is authenticated", async () => {
      mockGetUser.mockResolvedValue(mockUser);
      mockSadd.mockResolvedValue(1);

      await dismissChangelogAction("v200");

      expect(mockSadd).toHaveBeenCalledWith(
        `changelog:dismissed:${mockUser.id}`,
        "v200",
      );
    });

    it("should not call redis when user is not authenticated", async () => {
      mockGetUser.mockResolvedValue(null);

      await dismissChangelogAction("v200");

      expect(mockSadd).not.toHaveBeenCalled();
    });

    it("should handle multiple dismissals", async () => {
      mockGetUser.mockResolvedValue(mockUser);
      mockSadd.mockResolvedValue(1);

      await dismissChangelogAction("v200");
      await dismissChangelogAction("v150");

      expect(mockSadd).toHaveBeenCalledTimes(2);
      expect(mockSadd).toHaveBeenCalledWith(
        `changelog:dismissed:${mockUser.id}`,
        "v200",
      );
      expect(mockSadd).toHaveBeenCalledWith(
        `changelog:dismissed:${mockUser.id}`,
        "v150",
      );
    });
  });

  describe("getDismissedChangelogs", () => {
    it("should return dismissed slugs for authenticated user", async () => {
      mockGetUser.mockResolvedValue(mockUser);
      mockSmembers.mockResolvedValue(["v200", "v150"]);

      const result = await getDismissedChangelogs();

      expect(result).toEqual(["v200", "v150"]);
      expect(mockSmembers).toHaveBeenCalledWith(
        `changelog:dismissed:${mockUser.id}`,
      );
    });

    it("should return empty array when user is not authenticated", async () => {
      mockGetUser.mockResolvedValue(null);

      const result = await getDismissedChangelogs();

      expect(result).toEqual([]);
      expect(mockSmembers).not.toHaveBeenCalled();
    });

    it("should return empty array when no changelogs are dismissed", async () => {
      mockGetUser.mockResolvedValue(mockUser);
      mockSmembers.mockResolvedValue([]);

      const result = await getDismissedChangelogs();

      expect(result).toEqual([]);
    });
  });

  describe("resetDismissedChangelogsAction", () => {
    it("should delete all dismissed changelogs for authenticated user", async () => {
      mockGetUser.mockResolvedValue(mockUser);
      mockDel.mockResolvedValue(1);

      await resetDismissedChangelogsAction();

      expect(mockDel).toHaveBeenCalledWith(
        `changelog:dismissed:${mockUser.id}`,
      );
    });

    it("should not call redis when user is not authenticated", async () => {
      mockGetUser.mockResolvedValue(null);

      await resetDismissedChangelogsAction();

      expect(mockDel).not.toHaveBeenCalled();
    });
  });
});
