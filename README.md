# eAarogya Portal for Electronic Health Record Management (eAPEM)
eAPEM is a private blockchain based solution built for the problem statement submitted by Ministry of Health and Family Welfare in the Smart India Hackathon 2020. 
This application focuses on use of private blockchain to create and manage electronic health records on top of the existing Aadhaar Identity Infrastructure (UIDAI).

## Why private blockchain ? 
While desiging a system to be utilizied by a country like India, it is very important to keep in mind to tackle problems such as scalability, security and cost efficiency.
Private blockchains offer all the above along with decentralization in a closed ecosystem.

## Idea
The main idea of this application is to form a consortium of trusted parties and have a  **role based access** system headed by a central authority which in our case would be the government i.e the parties can only make transactions and call functions which are permitted to them. This is taken care by the **Certificate Authority or CA**. For Eg: The phamacist present in the network can only query the prescriptions while a clinician can add/query reports and prescriptions.

<p align="center">
    <img width="900" height="450" src="https://github.com/vaibhavmuchandi/eArogya-Portal-for-EHR-Management-eAPEM-/blob/master/eAarogya_network_diagram.png">
</p>

The role of the Central authority would be to add and remove entities from the consortium. 
Other consortium members included in the application: 
1. Clinician: A clinician peer would be allowed to add/query reports and prescription.
2. Radiologist: A radiologist peer can add/query reports and precriptions along with addition feature of adding medical images.
3. Pharmacist: A pharmacist peer can only query prescriptions.
4. Health Care provider: A healthcare provider peer can query reports and prescriptions.
5. Test Center: A test center peer can add reports only.
6. Researcher: A researcher peer can download dataset and visualize medical data from different parts of country only if permitted by the user.

<p align="center">
    <img width="700" height="350" src="https://github.com/vaibhavmuchandi/eArogya-Portal-for-EHR-Management-eAPEM-/blob/master/eAarogya_org_sequence.png">
</p>

#### Protecting users data
The users of the application/medical data holders are provided with a permission system. Using this permission system the record holders can add/revoke permission to a given organisation for accessibility of their medical records. The users are also provided with **crypto incentives** if they agree to share their data with researchers.

<p align="center">
    <img width="700" height="600" src="https://github.com/vaibhavmuchandi/eArogya-Portal-for-EHR-Management-eAPEM-/blob/master/eAarogya_User_Sequence.png">
</p>

#### Additional features
1. Localisation of the application, i.e the application is avaiable to use in multiple languages.
2. Easy to use mobile application for users: The users can use the mobile app to grant/revoke permission by just **scanning organisation's QR code**
3. Test centers are provided with a OCR functionality. The data can be entered automatically by uploading a medical report.
4. SMS Gateway is provieded for users through which they can use the functionalities by sending SMS.
5. Data visualisation for researchers.
6. Ethereum based crypto incentive system for users when they agree upon sharing their data for researcher purposes. 

## Getting started with the application
### Prerequisite
Make sure you have installed Docker and Nodejs v8.10.0

```
1. In the root directory first run ./start.sh : this will create the required containers
2. Then run ./setup.sh : this will connect the peers and install the chaincode
3. cd to ehr-api directory and run 'npm install'
3. Then run the enrollUsers.js files ( For all the users )
4. Finally, run 'npm start'
The application can then used at https://localhost:3000
```
### Built with
* [Hyperledger Fabric v1.4](https://https://github.com/hyperledger/fabric)
* [Nodejs v8.10.0](https://nodejs.org/dist/latest-v8.x/)
* [Embedded JS](https://ejs.co/)
* [React Native](https://reactnative.dev)

### Authors
1. **Vaibhav Muchandi** - [vaibhavmuchandi](https://github.com/vaibhavmuchandi)
2. **Varun Shiri** - [varunks99](https://github.com/varunks99)
3. **Larina Maskren** - [Larii2024](https://github.com/Lari2024)
4. **Naman Mehta** - [NamanMehta16](https://github.com/NamanMehta16)
5. **Sujay Amberkar** - [SujayAmberkar](https://github.com/SujayAmberkar)
6. **Shramik Murkute** - [Shramik99](https://github.com/Shramik99)

## License
This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details
