const { expect } = require("chai");


describe("Tourism groups Contract", () => {
  const setup = async ({ maxSupply = 10000 }) => {
    const [owner, addr1] = await ethers.getSigners();
    const TourismGroups = await ethers.getContractFactory("TourismGroups");
    const deployed = await TourismGroups.deploy(maxSupply);
    const expirationDate = Math.floor(Date.now() / 1000) + 1; // Fecha de caducidad 1 segundo en el futuro
    const startDate = Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60; // Start date 30 days from now

    console.log(expirationDate);
    console.log(startDate);
    const description = "Salida la primera semana de agosto desde Barcelona en el MSC Monarch en la cabina 2001"


    return {
      owner,
      deployed,
      expirationDate,
      startDate,
      description,
      addr1,
    };
  };

    describe("Deployment", () => {
        it("Sets max supply to passed param", async () => {
        const maxSupply = 4000;

        const { deployed } = await setup({ maxSupply });

        const returnedMaxSupply = await deployed.maxSupply();
        expect(maxSupply).to.equal(returnedMaxSupply);
        });
    });


    describe("Minting", () => {
        it("Mints a new token and assigns it to owner", async () => {
        const { owner, deployed, expirationDate, startDate, description} = await setup({});

        await deployed.mint(expirationDate, startDate, description);

        const ownerOfMinted = await deployed.ownerOf(0);

        expect(ownerOfMinted).to.equal(owner.address);
        });
    });

    
    it("Has a minting limit", async () => {
        const maxSupply = 2;

        const { deployed, expirationDate , startDate, description}  = await setup({ maxSupply });

        // Mint all
        await Promise.all([deployed.mint(expirationDate, startDate, description), deployed.mint(expirationDate, startDate, description)]);

        // Assert the last minting
        await expect(deployed.mint(expirationDate, startDate, description)).to.be.revertedWith(
            "Maximum supply reached"
        );
    });

    
    describe("tokenURI", () => {
      it("returns valid metadata", async () => {
        const { owner, deployed, expirationDate, startDate, description }  = await setup({});

        await deployed.mint(expirationDate, startDate, description);

        const tokenURI = await deployed.tokenURI(0);
        const stringifiedTokenURI = await tokenURI.toString();
        const [, base64JSON] = stringifiedTokenURI.split(
          "data:application/json;base64,"
        );
        const stringifiedMetadata = await Buffer.from(
          base64JSON,
          "base64"
        ).toString("ascii");

        console.log(stringifiedMetadata);
        const metadata = JSON.parse(stringifiedMetadata);
        

        expect(metadata).to.have.all.keys("name", "description", "image", "startDate");
      });
    });


    describe("burn", () => {
        it("burn token", async () => {
            const { deployed, expirationDate , startDate, description} = await setup({});
            const tokenId = 0;

            // Crea un nuevo token con fecha de caducidad 1 segundo en el futuro
            const token1 = await deployed.mint(expirationDate, startDate, description);
            console.log(await deployed.ownerOf(tokenId))
            
            // Espera 2 segundos para que el token expire
            await new Promise((resolve) => setTimeout(resolve, 3000));
 
            const result = await deployed.burnExpiredToken(tokenId);
            
            deployed.burnExpiredToken(0);

            await expect(deployed.burnExpiredToken(0)).to.be.revertedWith("Token does not exist");
            await expect(deployed.burnExpiredToken(212)).to.be.revertedWith("Token does not exist");
        });
    });


    describe("burn", () => {
        it("burn token", async () => {
            const { deployed, expirationDate , startDate, description} = await setup({});
            const tokenId = 0;

            // Crea un nuevo token con fecha de caducidad 1 segundo en el futuro
            const token1 = await deployed.mint(expirationDate, startDate, description);
            console.log(await deployed.ownerOf(tokenId))
            
            // Espera 2 segundos para que el token expire
            await new Promise((resolve) => setTimeout(resolve, 3000));
 
            const result = await deployed.burnExpiredToken(tokenId);
            
            deployed.burnExpiredToken(0);

            await expect(deployed.burnExpiredToken(0)).to.be.revertedWith("Token does not exist");
            await expect(deployed.burnExpiredToken(212)).to.be.revertedWith("Token does not exist");
        });
    });  
    
    describe("getExpirationDate", function () {
        it("should return the expiration date of a token", async function () {
        const { deployed, startDate, description} = await setup({});
        const expirationDate = 1000000000;
          await deployed.mint(expirationDate, startDate, description);
    
          const tokenId = 0;
          const result = await deployed.getExpirationDate(tokenId);
    
          expect(result).to.equal(expirationDate);
        });
    
        it("should revert when token does not exist", async function () {
          const { deployed} = await setup({});
          const tokenId = 0;
          await expect(deployed.getExpirationDate(tokenId)).to.be.revertedWith("Token does not exist");
        });
      });

      describe("burn", function () {
        it("should allow the owner to burn a token", async function () {
          const {owner, deployed, startDate, description} = await setup({});
          const expirationDate = 1000000000;
          await deployed.mint(expirationDate, startDate, description);
    
          const tokenId = 0;
          await expect(deployed.burn(tokenId))
          .to.emit(deployed, "Transfer")
          .withArgs(owner.address, "0x0000000000000000000000000000000000000000", tokenId);
  
    
          const exists = await deployed.exists(tokenId);
          expect(exists).to.be.false;
        });
    
        it("should revert when non-owner tries to burn a token", async function () {
          const { deployed, startDate, description, addr1} = await setup({});
          const expirationDate = 1000000000;
          await deployed.mint(expirationDate, startDate, description);
    
          const tokenId = 0;
          await expect(deployed.connect(addr1).burn(tokenId)).to.be.revertedWith("Unauthorized to burn");
        });
    
        it("should revert when burning a non-existent token", async function () {
          const { deployed} = await setup({});
          const tokenId = 0;
          await expect(deployed.burn(tokenId)).to.be.revertedWith("Token does not exist");
        });
      });

});
