import hre, { ethers } from 'hardhat'
import { expect } from 'chai'


describe('Vault', function () {
    it('should receive eth and emit certain event', async function () {
        let deployer, heir
        [deployer, heir] = await hre.ethers.getSigners()


        let vault = await hre.ethers.deployContract('Vault', [heir])
        const vaultAddress = await vault.getAddress()

        const vaultBalanceBefore = await hre.ethers.provider.getBalance(vaultAddress)
        const tx = await deployer.sendTransaction({
            to: vault.getAddress(),
            value: hre.ethers.parseEther('1')
        })
        const receipt = await tx.wait()

        const vaultBalanceAfter = await hre.ethers.provider.getBalance(vaultAddress)

        // assert event with address and value
        const log = receipt?.logs[0]
        const abi = [
            "event DepositEth(address sender, uint amount)"
        ]
        const iface = new hre.ethers.Interface(abi)

        const parsedLog = iface.parseLog(log)

        expect(parsedLog?.name).to.equal("DepositEth")
        expect(parsedLog?.args.sender).to.equal(deployer.address)
        expect(parsedLog?.args.amount).to.equal(hre.ethers.parseEther('1'))


        // assert address has xxx value
        expect(vaultBalanceAfter - vaultBalanceBefore).to.be.equal(await hre.ethers.parseEther('1'))
    })

    // it('should emit event with address and the amount', function () {

    // })

    // it('should be withdrawed all money by only one specific address', function () {
    //     await deployer.sendTransaction({
    //         to: vault.getAddress(),
    //         value: hre.ethers.parseEther('1')
    //     })
    // })
})