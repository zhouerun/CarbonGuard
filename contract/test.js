(async () => {
    try {
        console.log('🚀 Starting Comprehensive Carbon Credit Tests...');

        // 1. 准备阶段
        const metadata = JSON.parse(await remix.call('fileManager', 'getFile', 'browser/artifacts/SimpleCarbonCredit.json'));
        const accounts = await web3.eth.getAccounts();
        
        // 分配角色
        const owner = accounts[0];        // 合约所有者/审计员
        const projectOwner1 = accounts[1]; // 项目所有者1
        const projectOwner2 = accounts[2]; // 项目所有者2  
        const user1 = accounts[3];        // 普通用户1
        const user2 = accounts[4];        // 普通用户2

        console.log('👥 Accounts setup:');
        console.log('  Owner/Auditor:', owner);
        console.log('  Project Owner 1:', projectOwner1);
        console.log('  Project Owner 2:', projectOwner2);
        console.log('  User 1:', user1);
        console.log('  User 2:', user2);

        // 2. 部署合约
        console.log('\n📄 Deploying contract...');
        let contract = new web3.eth.Contract(metadata.abi);
        contract = contract.deploy({
            data: metadata.data.bytecode.object,
            arguments: ["https://example.com/api/token/"]
        });

        let contractInstance = await contract.send({
            from: owner,
            gas: 6000000
        });
        console.log('✅ Contract deployed at:', contractInstance.options.address);

        // 3. 设置费用参数
        console.log('\n💰 Setting fee parameters...');
        await contractInstance.methods.setFees(
            web3.utils.toWei('0.001', 'ether'), // initFeePerProject
            web3.utils.toWei('0.0001', 'ether'), // mintFeePerCredit
            web3.utils.toWei('0.00001', 'ether') // retireFeePerCredit
        ).send({ from: owner, gas: 200000 });
        console.log('✅ Fees set successfully');

        // 4. 测试1: 创建多个项目
        console.log('\n🏗️  Test 1: Creating multiple projects...');
        
        const initFee = await contractInstance.methods.initFeePerProject().call();
        
        // 项目1
        await contractInstance.methods.createProject(
            "PROJ-001",
            "Reforestation",
            "Amazon Rainforest, Brazil",
            "https://example.com/projects/reforestation-001.json"
        ).send({
            from: projectOwner1,
            value: initFee,
            gas: 400000
        });
        console.log('✅ Project 1 created by', projectOwner1);

        // 项目2
        await contractInstance.methods.createProject(
            "PROJ-002", 
            "Solar Farm",
            "Nevada Desert, USA",
            "https://example.com/projects/solar-farm-002.json"
        ).send({
            from: projectOwner2,
            value: initFee,
            gas: 400000
        });
        console.log('✅ Project 2 created by', projectOwner2);

        // 5. 测试2: 验证项目
        console.log('\n🔍 Test 2: Verifying projects...');
        
        await contractInstance.methods.verifyProject(1, 10000).send({
            from: owner, // auditor
            gas: 200000
        });
        console.log('✅ Project 1 verified with 10,000 credits');

        await contractInstance.methods.verifyProject(2, 5000).send({
            from: owner,
            gas: 200000
        });
        console.log('✅ Project 2 verified with 5,000 credits');

        // 6. 测试3: 铸造碳信用
        console.log('\n🪙 Test 3: Minting carbon credits...');
        
        const mintFeePer = await contractInstance.methods.mintFeePerCredit().call();
        
        // 项目1铸造
        await contractInstance.methods.mintCarbonCredit(1, projectOwner1, 1000).send({
            from: projectOwner1,
            value: mintFeePer * 1000,
            gas: 400000
        });
        console.log('✅ Minted 1,000 credits for Project 1');

        // 项目2铸造  
        await contractInstance.methods.mintCarbonCredit(2, projectOwner2, 500).send({
            from: projectOwner2,
            value: mintFeePer * 500,
            gas: 400000
        });
        console.log('✅ Minted 500 credits for Project 2');

        // 7. 测试4: 转移代币
        console.log('\n🔄 Test 4: Transferring tokens between users...');
        
        // 项目所有者1转移给用户1
        await contractInstance.methods.safeTransferFrom(projectOwner1, user1, 1, 300, "0x").send({
            from: projectOwner1,
            gas: 200000
        });
        console.log('✅ Transferred 300 credits from Project Owner 1 to User 1');

        // 项目所有者2转移给用户2
        await contractInstance.methods.safeTransferFrom(projectOwner2, user2, 2, 200, "0x").send({
            from: projectOwner2,
            gas: 200000
        });
        console.log('✅ Transferred 200 credits from Project Owner 2 to User 2');

        // 8. 测试5: 退休碳信用
        console.log('\n♻️  Test 5: Retiring carbon credits...');
        
        const retireFeePer = await contractInstance.methods.retireFeePerCredit().call();
        
        // 用户1退休
        await contractInstance.methods.retireCarbonCredit(1, 100, "Carbon neutral event").send({
            from: user1,
            value: retireFeePer * 100,
            gas: 300000
        });
        console.log('✅ User 1 retired 100 credits for event');

        // 用户2退休
        await contractInstance.methods.retireCarbonCredit(2, 50, "Sustainable product manufacturing").send({
            from: user2, 
            value: retireFeePer * 50,
            gas: 300000
        });
        console.log('✅ User 2 retired 50 credits for manufacturing');

        // 9. 测试6: 批量操作
        console.log('\n📦 Test 6: Batch operations...');
        
        // 批量铸造 (项目1再铸造一些)
        await contractInstance.methods.mintCarbonCredit(1, projectOwner1, 200).send({
            from: projectOwner1,
            value: mintFeePer * 200,
            gas: 300000
        });
        console.log('✅ Batch minted 200 additional credits');

        // 10. 测试7: 边界情况测试
        console.log('\n⚠️  Test 7: Edge cases...');
        
        try {
            // 尝试铸造超过验证数量的碳信用
            await contractInstance.methods.mintCarbonCredit(1, projectOwner1, 100000).send({
                from: projectOwner1,
                value: mintFeePer * 100000,
                gas: 300000
            });
            console.log('❌ Should have failed - minting over verified limit');
        } catch (error) {
            console.log('✅ Correctly prevented minting over verified limit');
        }

        try {
            // 尝试用不足的费用创建项目
            await contractInstance.methods.createProject(
                "PROJ-003",
                "Wind Farm", 
                "North Sea",
                "https://example.com/projects/wind-003.json"
            ).send({
                from: user1,
                value: web3.utils.toWei('0.0001', 'ether'), // 不足的费用
                gas: 400000
            });
            console.log('❌ Should have failed - insufficient fee');
        } catch (error) {
            console.log('✅ Correctly prevented creation with insufficient fee');
        }

        // 11. 测试8: 权限测试
        console.log('\n🔐 Test 8: Permission tests...');
        
        try {
            // 非审计员尝试验证项目
            await contractInstance.methods.verifyProject(1, 5000).send({
                from: user1,
                gas: 200000
            });
            console.log('❌ Should have failed - non-auditor verification');
        } catch (error) {
            console.log('✅ Correctly prevented non-auditor from verifying');
        }

        try {
            // 非项目所有者尝试铸造
            await contractInstance.methods.mintCarbonCredit(1, user1, 100).send({
                from: user1,
                value: mintFeePer * 100,
                gas: 300000
            });
            console.log('❌ Should have failed - non-owner minting');
        } catch (error) {
            console.log('✅ Correctly prevented non-owner from minting');
        }

        // 12. 最终状态查询
        console.log('\n📊 Final State Report:');
        
        const totalProjects = await contractInstance.methods.getTotalProjects().call();
        console.log(`📈 Total Projects: ${totalProjects}`);
        
        const totalRevenue = await contractInstance.methods.totalFeeRevenue().call();
        console.log(`💰 Total Fee Revenue: ${web3.utils.fromWei(totalRevenue, 'ether')} ETH`);
        
        // 查询每个项目状态
        for (let i = 1; i <= totalProjects; i++) {
            const project = await contractInstance.methods.getProjectInfo(i).call();
            const activeCredits = await contractInstance.methods.getActiveCredits(i).call();
            const balanceOwner = await contractInstance.methods.balanceOf(project.projectOwner, i).call();
            const uri = await contractInstance.methods.uri(i).call();
            
            console.log(`\n📋 Project ${i}:`);
            console.log(`   Owner: ${project.projectOwner}`);
            console.log(`   Type: ${project.projectType}`);
            console.log(`   Status: ${project.status}`);
            console.log(`   Verified: ${project.verifiedCredits}`);
            console.log(`   Minted: ${project.mintedCredits}`);
            console.log(`   Retired: ${project.retiredCredits}`);
            console.log(`   Active: ${activeCredits}`);
            console.log(`   Owner Balance: ${balanceOwner}`);
            console.log(`   URI: ${uri}`);
        }
        
        // 查询用户余额
        console.log('\n👤 User Balances:');
        const user1Balance1 = await contractInstance.methods.balanceOf(user1, 1).call();
        const user1Balance2 = await contractInstance.methods.balanceOf(user1, 2).call();
        const user2Balance1 = await contractInstance.methods.balanceOf(user2, 1).call();
        const user2Balance2 = await contractInstance.methods.balanceOf(user2, 2).call();
        
        console.log(`   User1 - Project1: ${user1Balance1}, Project2: ${user1Balance2}`);
        console.log(`   User2 - Project1: ${user2Balance1}, Project2: ${user2Balance2}`);

        console.log('\n🎉 All comprehensive tests completed successfully!');

    } catch (error) {
        console.error('💥 Test failed with error:', error);
    }
})();