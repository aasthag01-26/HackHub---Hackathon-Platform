import { StudentRegistration } from "../types/registration";

describe("StudentRegistration Schema", () => {
  it("verifies registration with project submission", () => {
    const reg: StudentRegistration = {
      id: "reg-1",
      hackathonId: "h-1",
      hackathonTitle: "Test Hack",
      registrationType: "team",
      teamName: "Alpha",
      teamMembers: [{ name: "Alex", email: "alex@test.com", role: "Lead", confirmed: true }],
      participationStatus: "accepted",
      invitationCode: "KEY-123",
      registeredAt: new Date().toISOString()
    };
    expect(reg.registrationType).toBe("team");
    expect(reg.participationStatus).toBe("accepted");
  });
});
