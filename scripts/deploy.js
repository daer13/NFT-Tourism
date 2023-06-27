
const deploy = async() => {
    const [deployer] = await ethers.getSigners();

    console.log("Deploying contract with the account:", deployer.address);
    const TourismGroups = await ethers.getContractFactory("TourismGroups");
    const deployed = await TourismGroups.deploy(10);

    console.log("TourismGroups is deployed at: ", deployed.target);
};

deploy()
    .then(() => process.exit(0))
    .catch((error) => {
        console.log(error);
        process.exit(1);
    });
