---
title: About Brandon Xiang
date: 2023-12-16T11:59:57.000Z
description: Brandonxiang's CV, Weiping.xiang's CV
---

My Chinese name is Weiping XIANG.

## Self-Introduction

1. 12 years of web front-end development experience, widely dabbled in front-end development, and have in-depth research in front-end engineering. I have a Geek spirit with pursuing clean code. Skilled in React, Vue, React Native, Nodejs, webpack, vite and etc.
2. The technical rank is Expert Engineer, with full-stack development ability (Nodejs server, Web, React Native)
3. As a Tech Leader, I have the ability to lead the team and train team members. I have already assisted 9 colleagues in the team to complete promotion defense
4. Participated in two company-level Tech Summits (in English), one Tencent cloud organization open technology sharing, wrote an article on the company's official account, and assisted team members to publish two official account articles
5. Participated in open source project development as an amateur, with a certain influence in github

## Education Experience

- The Hong Kong Polytechnic University (Geomatic, Master) 2013.09-2015.01
- Sun Yat-sen University (Geographic Information System, Bachelor) 2009.09-2013.06

## Job Experience

### Shopee (2019.5-present)

**Merchant Service BG (Expert Engineer & Team Leader)**

Business aspects:

- Responsible for the development of RN, PCWeb and Admin ends of digital products in Southeast Asia such as phone bill，ewallet topup，train ticket
- Responsible for the development of Southeast Asian merchant information center system and mobile H5 end of customer onboarding business
- Responsible for the development of RN and PCweb ends of CRM in Southeast Asia - Responsible for the development tasks of three Apps: Partner, Mitra, and Foms

Technical aspects:

- Main technology stack: React / React Native / Antd / Antd mobile / Vite / Formily
- Using RN decentralized technology to achieve "multi-team joint development in a super APP", accessing 7 teams and 14 business packages, meeting tens of thousands of release construction tasks
- Using micro front-end technology to achieve "alternating update of new and old systems", gradually and progressively reconstructing code without affecting online business
- Using micro front-end technology to achieve "multi-team joint development in a merchant portal", accessing 5 teams and 6 business packages
- Responsible for the development of infrastructure such as the company's RN package hot update system, webpage gray release, CICD, virtual multi-test environment and component library construction

Team aspects:

- As the team leader, responsible for the task scheduling of daily iterative requirements, code review, technical scheme review and team technical specification formulation
- Lead and participate in the construction of product line-level macro front-end direction, pulling through the technology stack of each business group (tools, libraries, infrastructure)
- Participate in school recruitment training, company-level sharing, new employees interview, etc.
- Performance: A or B+

### Ping An Insurance (2017.04-2019.05)

**Agent Project Team (Front-end Developer)**

Business aspects:

- Responsible for the development of mobile web pages and admin portal required by the marketing activities of the exclusive E-marketing App for Ping An insurance agents, including insurance product details, insurance market and etc.
- Led 4 colleaguesto complete task arrangements such as mobile web pages, PC website, etc.

Technical aspects:

- Proficient in webpack packaging principles and performance optimization (lazy loading, gzip compression, CommonsChunkPlugin and DllPlugin to extract public JS modules, image-webpack-loader image compression optimization, Qiniu webp online image processing, pre-rendering, etc.)
- Able to write component libraries and deal with the browser compatibility problem
- Use wepy framework to write wechat mini-programe to ensure the expandability and development efficiency of the project
- Use cordova.js to interact with native
- Use workbox to accomplish the website offline caching
- Performance: A or B

### Shenzhen Etop Information Company (2015.01-2017.04)

**Technical Department (Front-end Engineer)**

- System development projects for government enterprises and institutions
- Support responsive layout compatible with PC and mobile
- Use leaflet.js and echart.js to do spatial data visualization

## Project Experience

### Project 1 Decentralized React Native Hot Update System

1. Background: Shopee App is a super application, which has multiple RN packages of different businesses internally, but when packaging and publishing, they need to be integrated together, causing a great efficiency problem. Therefore, we proposed a decentralized architecture design, which provides business teams with the flexibility to master their own release plans.At the same time, we isolated the execution environment of the code to avoid conflicts between businesses, balancing their flexibility and stability.
2. Responsibilities: Responsible for coordinating the progress of the entire project; using RN packaging technology to meet the transformation of the system from separate packaging to decentralized publishing; using nodejs service technologies such as fastify+grpc+mysql+redis to meet the independent deployment, permission isolation and efficient collaboration of multiple teams; in order to save the mobile data traffic, we proposed difference calculation of RN static resources, and improved the differential algorithm folder-bsdiff to save network traffic.
3. Achievements: Access to multiple business teams of Shopee, including Mitra, Shopeepay, Food, Local Service, Toc group, Supply Chain. The service tested with 4 cores, 4g RAM and 3 pods, the q/s was about 5000. The http peak traffic of a single app reached 164k every 5 minutes, with an average of 40k. The project satisfied the needs of mitra accessing shopeepay business and partner accessing mitra business, laying a foundation for the horizontal expansion of Shopee ecology.

The achievement was shared in the company-level TechSummit.

### Project 2 Website Performance Optimization

1. Background: In Shopee Web project, many hand-over projects have technical debt. With the rapid development of business, performance problems are highlighted. Multi-region internationalization, package size of the project and local network conditions will affect the loading efficiency of the page.
2. Combined with the specific business scenario, we optimized from the aspects of construction efficiency and user loading efficiency: a. Clear the project cycle dependency, utilize micro-frontend to do code refactor, ensure that the new and old deployment units can operate in the same website, and replace the building tool from webpack to vite; b. Translate the files according to the region on demand asynchronous loading, self-developed i18n-shaking tool, remove the useless translation files, use service-worker to do offline caching and ensure the loading efficiency in the case of weak network
3. Results: Single JS file size was reduced by more than 60%, the overall size was optimized by 27%, the debugging start-up speed was increased by about 80%, and the first screen loading time was reduced by 68%.

### Project 3 Web Grayscale Publish System

1. Introduction: The business had the demand of webpage grayscale publishing, so that some users could experience the new version of content first, reducing the publishing risk.
2. Responsibilities: Built a webpage grayscale publishing system by using fastify+openresty technology, and stored the business html as gray content in the database. Openresty displayed the corresponding page template for users who hit the rule through the user information in the cookie. This could meet a series of R&D cycle work such as page construction, publishing, gray, rollback, etc. And proposed the combination with micro front-end technology, displayed multiple template systems in a html page through forwarding and Qiankun, and realized the independent publishing of multiple teams.
3. Results: Played a decisive role in the large-scale demand changes such as changing the trademark on the official website and the version change of the admission process. Combined with multiple test environments and micro front-end technology, it could meet all webpage publishing in the product line.
    This achievement was shared in the company-level TechSummit.

### Project 4 Virtual Multiple Test Environment

1. Background: In the daily iteration of the team, there are multiple versions of parallel development and testing, and each region only has one set of development environment, so we urgently need a virtual multi-environment design that can isolate the needs of development environment.
2. Responsibilities: inject version parameters into the k8s pod container; complete nginx/etcd modification, by using a specific cookie to get through the whole process like corresponding background service
3. Achievements: The virtual multi-environment design was adopted in the company's infra team management. It became a part of the company's infrastructure.

### Project 5 Merchant Front-end Engineering Construction

1. Background: The Merchant group contains three business groups. There are many reusable components and common logic in its business, so I led the design and development of the Web and RN component library of the Merchant business line. Adjustment of front-end engineering architecture for business project warehouse.
2. Responsibilities: Use yarn berry workspace and changeset to implement monorepo to unify the code management of component library and tool library to avoid behind closed doors; use gitlab ci command to implement CICD (unit testing, document output, automatic package delivery) after merging into master; Utilized customized scripts to implement basic scaffolding. In order to improve engineering efficiency, integrated multiple business modules into a big warehouse, developed self-developed workflow tools, and optimized the overall R&D process.
3. Results: Output 24 basic components, which were widely used in business lines. Integrate eslint, build tools and CICD process.

### Project 6 One Credential Merchant Login Solution

1. Background: Previously, the company did not have a unified one-stop login solution for merchants. At the business level, in order to meet the business process of merchant login, our team participated in the development of the business process, which could establish a connection between toc accounts and tob accounts. For Partner App, Partner Web and the third-party service MyStock, registered using the Shopee main station account, bound the merchant tob account, selected the corresponding store, and realized the opening of the account system.
2. Responsibilities: Responsible for the overall scheme design, participated in the coding of nodejs service part, and the coding of PC-side page logic.
3. Results: Implemented the unified login solution for 7 business teams in Partner App, realized oauth2.0 login using nodejs service, and realized the association and binding of toc and tob accounts.

### Project 7 Mitra Configurable Commodity System

1. Background: Mitra is a platform for selling digital products for small shop in Southeast Asia, aiming to solve the difficulty of charging and paying caused by the low penetration rate of mobile devices in Southeast Asia. There are many customized localization requirements for merchants. For bill information, order information, receipt information, SMS information, we implemented configurable processing of low-level code, so that operators can directly modify fields, formats, display order, change pages in real time, and improve operation and maintenance efficiency.
2. Responsibilities: Responsible for overall scheme design, technical scheme review and code review of each part;as the project PIC, I presided over the weekly project meeting and aligned risks.
3. Results: The overall efficiency of goods online has been improved by 75%, saving the workload of product communication, development, testing and other R&D processes.

我是一位web developer，一位有灵魂的全栈开发工程师。

我追求的是成为一名优秀的Open Sourcer以及新技术的布道者。千里之行，始于足下。

## 我的社交

- notion: [@brandonxiang](https://brandonxiang.notion.site/brandonxiang-notion-078346416d174cb0bf79e0023ef7d8af)
- github：[@brandonxiang](https://github.com/brandonxiang)
- 公众号： @大前端从入门到跑路
- 掘金：[@brandonxiang](https://juejin.cn/user/2172290706443639)
- 简书：[@brandonxiang](https://www.jianshu.com/u/64467c788eb7)
- 微博：[@一久肆叁](https://weibo.com/xwpisme)
- 知乎：[@项伟平](https://www.zhihu.com/people/xiang-wei-ping)
- QQ：@1542453460

![扫码关注公众号](https://brandonxiang.top/img/wechat.jpg)

> **扫码关注公众号**

![SYSU](https://brandonxiang.top/img/sysu.gif)
