import hre, { ethers } from 'hardhat'
import { expect } from 'chai'


describe('Vault', function () {
    it('should receive correct amount of eth', async function () {
        let deployer, heir
        [deployer, heir] = await hre.ethers.getSigners()

        let vault = await hre.ethers.deployContract('Vault', [heir])
        const vaultAddress = await vault.getAddress()

        const vaultBalanceBefore = await hre.ethers.provider.getBalance(vaultAddress)
        await deployer.sendTransaction({
            to: vault.getAddress(),
            value: hre.ethers.parseEther('1')
        })

        const vaultBalanceAfter = await hre.ethers.provider.getBalance(vaultAddress)
        // assert address has xxx value
        expect(vaultBalanceAfter - vaultBalanceBefore).to.be.equal(await hre.ethers.parseEther('1'))
    })

    it('should emit event with address and the amount', async function () {
        let deployer, heir
        [deployer, heir] = await hre.ethers.getSigners()

        let vault = await hre.ethers.deployContract('Vault', [heir])

        const tx = await deployer.sendTransaction({
            to: vault.getAddress(),
            value: hre.ethers.parseEther('1')
        })
        const receipt = await tx.wait()

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
    })

    it('should be withdrawed by only one specific address', async function () {
        let deployer, heir
        [deployer, heir] = await hre.ethers.getSigners()

        const balanceOriginal = await hre.ethers.provider.getBalance(heir.address)

        let vault = await hre.ethers.deployContract('Vault', [heir])

        const tx = await deployer.sendTransaction({
            to: vault.getAddress(),
            value: hre.ethers.parseEther('1')
        })

        // as of now, there's 1 ether in the vault
        const v = await vault.connect(heir)
        await v.withdraw()

        const receipt = await tx.wait()
        const gasUsed = receipt.gasUsed
        const gasPrice = receipt.gasPrice

        const balanceAfter = await hre.ethers.provider.getBalance(heir.address)

        const expectedIncrease = hre.ethers.parseEther('1')  // vault中的ETH
        const actualIncrease = balanceAfter - balanceOriginal

        // 扣掉gas fee之後的增加量
        const expectedNetIncrease = expectedIncrease - gasUsed * gasPrice

        expect(actualIncrease).to.be.approximately(expectedNetIncrease, 100000000000000)
    })
})