import * as pulumi from "@pulumi/pulumi";
import * as aws from "@pulumi/aws";

// Create a VPC
const vpc = new aws.ec2.Vpc("redis-vpc", {
    cidrBlock: "10.0.0.0/16",
    enableDnsHostnames: true,
    enableDnsSupport: true,
    tags: {
        Name: "redis-vpc",
    },
});

// Export the VPC ID
export const vpcId = vpc.id;

const publicSubnet1 = new aws.ec2.Subnet("subnet-1", {
    vpcId: vpc.id,
    cidrBlock: "10.0.1.0/24",
    availabilityZone: "ap-southeast-1a",
    mapPublicIpOnLaunch: true,
    tags: {
        Name: "subnet-1",
    },
});
export const publicSubnet1Id = publicSubnet1.id;

const publicSubnet2 = new aws.ec2.Subnet("subnet-2", {
    vpcId: vpc.id,
    cidrBlock: "10.0.2.0/24",
    availabilityZone: "ap-southeast-1b",
    mapPublicIpOnLaunch: true,
    tags: {
        Name: "subnet-2",
    },
});
export const publicSubnet2Id = publicSubnet2.id;

const publicSubnet3 = new aws.ec2.Subnet("subnet-3", {
    vpcId: vpc.id,
    cidrBlock: "10.0.3.0/24",
    availabilityZone: "ap-southeast-1c",
    mapPublicIpOnLaunch: true,
    tags: {
        Name: "subnet-3",
    },
});
export const publicSubnet3Id = publicSubnet3.id;

const internetGateway = new aws.ec2.InternetGateway("redis-igw", {
    vpcId: vpc.id,
    tags: {
        Name: "redis-igw",
    },
});
export const igwId = internetGateway.id;

const publicRouteTable = new aws.ec2.RouteTable("redis-rt", {
    vpcId: vpc.id,
    tags: {
        Name: "redis-rt",
    },
});
export const publicRouteTableId = publicRouteTable.id;

const route = new aws.ec2.Route("igw-route", {
    routeTableId: publicRouteTable.id,
    destinationCidrBlock: "0.0.0.0/0",
    gatewayId: internetGateway.id,
});

const rtAssociation1 = new aws.ec2.RouteTableAssociation("rt-association-1", {
    subnetId: publicSubnet1.id,
    routeTableId: publicRouteTable.id,
});
const rtAssociation2 = new aws.ec2.RouteTableAssociation("rt-association-2", {
    subnetId: publicSubnet2.id,
    routeTableId: publicRouteTable.id,
});
const rtAssociation3 = new aws.ec2.RouteTableAssociation("rt-association-3", {
    subnetId: publicSubnet3.id,
    routeTableId: publicRouteTable.id,
});

// Create a Security Group for the Node.js and Redis Instances
const redisSecurityGroup = new aws.ec2.SecurityGroup("redis-secgrp", {
    vpcId: vpc.id,
    description: "Allow SSH, Redis, and Node.js traffic",
    ingress: [
        { protocol: "tcp", fromPort: 22, toPort: 22, cidrBlocks: ["0.0.0.0/0"] },  // SSH
        { protocol: "tcp", fromPort: 6379, toPort: 6379, cidrBlocks: ["10.0.0.0/16"] },  // Redis
        { protocol: "tcp", fromPort: 16379, toPort: 16379, cidrBlocks: ["10.0.0.0/16"] },  // Redis Cluster
        { protocol: "tcp", fromPort: 3000, toPort: 3000, cidrBlocks: ["0.0.0.0/0"] },  // Node.js (Port 3000)
    ],
    egress: [
        { protocol: "-1", fromPort: 0, toPort: 0, cidrBlocks: ["0.0.0.0/0"] }  // Allow all outbound traffic
    ],
    tags: {
        Name: "redis-secgrp",
    },
});
export const redisSecurityGroupId = redisSecurityGroup.id;

const amiId = "ami-01811d4912b4ccb26";  // Ubuntu 24.04 LTS

// Create a Node.js Instance in the first subnet (ap-southeast-1a)
const nodejsInstance = new aws.ec2.Instance("nodejs-instance", {
    instanceType: "t2.micro",
    vpcSecurityGroupIds: [redisSecurityGroup.id], // Ensure redisSecurityGroup is defined
    ami: amiId,
    subnetId: publicSubnet1.id, // Ensure publicSubnet1 is defined
    keyName: "MyKeyPair",  // Replace with your actual key pair name
    associatePublicIpAddress: true,
    tags: {
        Name: "nodejs-instance",
        Environment: "Development",
        Project: "RedisSetup",
    },
});

export const nodejsInstanceId = nodejsInstance.id;
export const nodejsInstancePublicIp = nodejsInstance.publicIp;

const createRedisInstance = (name: string, subnetId: string): aws.ec2.Instance => {
    return new aws.ec2.Instance(name, {
        instanceType: "t2.micro",
        vpcSecurityGroupIds: [redisSecurityGroup.id], // Ensure redisSecurityGroup is defined
        ami: amiId,
        subnetId: subnetId,
        keyName: "MyKeyPair", // Replace with your actual key pair name
        associatePublicIpAddress: true,
        tags: {
            Name: name,
            Environment: "Development",
            Project: "RedisSetup",
        },
    });
};

// Create Redis Instances
const redisInstance1 = createRedisInstance("redis-instance-1", publicSubnet2.id as any);
const redisInstance2 = createRedisInstance("redis-instance-2", publicSubnet2.id as any);
const redisInstance3 = createRedisInstance("redis-instance-3", publicSubnet2.id as any);
const redisInstance4 = createRedisInstance("redis-instance-4", publicSubnet3.id as any);
const redisInstance5 = createRedisInstance("redis-instance-5", publicSubnet3.id as any);
const redisInstance6 = createRedisInstance("redis-instance-6", publicSubnet3.id as any);

export const redisInstance1Id = redisInstance1.id;
export const redisInstance1PublicIp = redisInstance1.publicIp;
export const redisInstance2Id = redisInstance2.id;
export const redisInstance2PublicIp = redisInstance2.publicIp;
export const redisInstance3Id = redisInstance3.id;
export const redisInstance3PublicIp = redisInstance3.publicIp;
export const redisInstance4Id = redisInstance4.id;
export const redisInstance4PublicIp = redisInstance4.publicIp;
export const redisInstance5Id = redisInstance5.id;
export const redisInstance5PublicIp = redisInstance5.publicIp;
export const redisInstance6Id = redisInstance6.id;
export const redisInstance6PublicIp = redisInstance6.publicIp;
