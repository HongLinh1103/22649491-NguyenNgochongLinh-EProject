const chai = require("chai");
const chaiHttp = require("chai-http");
const jwt = require("jsonwebtoken");
const App = require("../app");
const expect = chai.expect;
require("dotenv").config();

chai.use(chaiHttp);


describe("Products", () => {
  let app;
  let authToken;

  before(async () => {
    app = new App({ skipMessageBroker: true });
    await app.connectDB();

    // Generate a test JWT token instead of calling auth service
    // This avoids dependency on auth service being running
    authToken = jwt.sign(
      { userId: "test-user-id", username: "testuser" },
      process.env.JWT_SECRET || "supersecret",
      { expiresIn: "1h" }
    );
    
    console.log("Test token generated:", authToken);
    // Start on an ephemeral port to avoid conflicts
    app.start(0);
  });

  after(async () => {
    await app.stop();
  });

  describe("POST /products", () => {
    it("should create a new product", async () => {
      const product = {
        name: "Product 1",
        description: "Description of Product 1",
        price: 10,
      };
      const res = await chai
        .request(app.app)
        .post("/api/products")
        .set("Authorization", `Bearer ${authToken}`)
        .send({
            name: "Product 1",
            price: 10,
            description: "Description of Product 1"
          });

      expect(res).to.have.status(201);
      expect(res.body).to.have.property("_id");
      expect(res.body).to.have.property("name", product.name);
      expect(res.body).to.have.property("description", product.description);
      expect(res.body).to.have.property("price", product.price);
    });

    it("should return an error if name is missing", async () => {
      const product = {
        description: "Description of Product 1",
        price: 10.99,
      };
      const res = await chai
        .request(app.app)
        .post("/api/products")
        .set("Authorization", `Bearer ${authToken}`)
        .send(product);

      expect(res).to.have.status(400);
    });
  });
});

