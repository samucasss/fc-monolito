import { app, sequelize } from "../express";
import request from "supertest";

describe("E2E test for client", () => {
    beforeEach(async () => {
      await sequelize.sync({ force: true });
    });
  
    afterAll(async () => {
      await sequelize.close();
    });
  
    it("should create a client", async () => {
      const response = await request(app)
        .post("/clients")
        .send({
          name: "John",
          email: "John@gmail.com",
          document: "123456789",
          address: {
            street: "Rua 123",
            number: 99,
            complement: "Casa Verde",
            city: "Criciúma",
            state: "SC",
            zipCode: "88888-888",
          },
        });
  
      expect(response.status).toBe(200);
      expect(response.body.name).toBe("John");
      expect(response.body.email).toBe("John@gmail.com");
      expect(response.body.document).toBe("123456789");
      expect(response.body.address.street).toBe("Rua 123");
      expect(response.body.address.number).toBe(99);
      expect(response.body.address.complement).toBe("Casa Verde");
      expect(response.body.address.city).toBe("Criciúma");
      expect(response.body.address.state).toBe("SC");
      expect(response.body.address.zipCode).toBe("88888-888");
    });

});