import { InAppNotification } from "../types/notifications";

describe("InAppNotification validation", () => {
  it("validates notification structure", () => {
    const notif: InAppNotification = {
      id: "test-1",
      category: "team_invitation",
      title: "Test Invite",
      message: "You have been invited",
      timestamp: "Just now",
      read: false
    };
    expect(notif.read).toBe(false);
    expect(notif.category).toBe("team_invitation");
  });
});
