---
title: "热力学之墙：AI扩展定律与物理基础设施的碰撞"
date: "2025-12-21"
author: "Charlie Feng"
description: "深入剖析AI扩展面临的能源约束，探索指数级计算需求与物理基础设施限制之间的碰撞。"
---

## 执行摘要
全球技术基础设施行业正处于一个由两股对立力量定义的悬崖边：人工智能（AI）扩展定律的指数轨迹，以及物理热力学和公用事业基础设施的线性、刚性约束。本报告对这一“热力学之墙”进行了详尽的深度研究分析，这一障碍威胁要在未来十年内阻碍前沿AI模型的进步。
本分析的核心论点是，由过剩电网容量和环境空气冷却补贴的无限制数字增长时代已经结束。我们正在进入“物理AI”阶段，智能的主要瓶颈不再是算法或硅基的，而是热力学和地质学的。电子的稀缺性、排热能力和能量传输的密度将决定AI军备竞赛的赢家。

```infographic collision
collision
```

我们的分析预测，到2030年，最大规模的AI训练运行将需要4到10千兆瓦（GW）的电力——相当于多个核电站的输出——而推理工作负载将产生与国家工业消耗相媲美的长尾能源需求。[^1] 这条需求曲线直接与美国电网发生冲突，后者的特点是互连队列平均耗时五年，且制造业难以生产用于下一代核反应堆的高纯度低浓缩铀（HALEU）。[^2]
本报告剖析了这种碰撞的机制，探讨了基础设施不对称中可用的杠杆点（如硅光子学、有源电缆和软件定义电力），并概述了2025年的最佳“绿色计算”战略。报告认为，虽然热力学之墙是巨大的，但它作为必要架构演变的强制功能，推动行业向液冷、现场发电和光互连发展。分析借鉴了“行星森林”模型的概念，作为“巴别塔”方法的对立面，建议从单一的中心化转向分布式的仿生弹性。[^4]
---
## 第1部分：墙的机制——能源、熵与AI扩展
要理解热力学之墙，首先必须量化撞击它的力量。对计算的需求不仅在增长；它正在经历由分析型AI向生成型和推理型模型转变驱动的相变。这种转变代表了经济价值创造与能源效率的根本脱钩，威胁要使智能的边际成本在能源上变得不可持续。
### 1.1 定律的碰撞：摩尔、库米与扩展
历史上，数据中心行业依赖于摩尔定律（晶体管密度翻倍）和库米定律（每焦耳计算量每1.57年翻倍）之间的共生关系。这种效率允许性能呈指数级增长，而能源消耗没有相应的爆炸式增长。然而，当前的大语言模型（LLM）和生成式AI时代已经打破了这种平衡。
训练前沿模型的计算需求大约每六个月翻一番，远远超过了硬件的效率增益。[^5] 这种分歧造成了巨大的能源赤字。例如，训练GPT-3大约需要1.29 GWh，而GPT-4估计消耗了超过50 GWh——仅一代就增加了40倍。[^6] 这不仅仅是现有工作负载的扩展，而是数字认知“代谢率”的根本变化。
这种需求的物理表现是功率密度。传统的企业数据中心机架运行在7-10 kW。当前利用NVIDIA H100或Blackwell架构的AI就绪机架需求从40 kW到超过100 kW。[^6] 密度的十倍增加打破了三十年来定义数据中心架构的标准风冷模型。“热力学之墙”部分是一场排热危机：空气根本不足以带走20平方英尺范围内100 kW硅片产生的废热。
此外，“认知的造林架构”指出，我们正在接近“能源墙”，即额外智能的边际成本超过产生的经济价值。[^4] 使用当前的硅架构模拟人脑活动将需要数十亿瓦特的能量——比仅需20瓦特运行的生物大脑多出$10^9$倍。[^4] 这种差异突显了当前“暴力”扩展范式的严重热力学低效，需要转向仿生和神经形态架构以绕过这堵墙。
### 1.2 能源的分流：训练与推理
一般能源分析中经常忽略的一个关键区别是AI训练和AI推理的不同热力学特征。这两种工作负载对电网施加根本不同的压力，需要不同的基础设施策略。

```infographic mechanics
mechanics
```






#### 1.2.1 训练：千兆瓦的尖峰
训练前沿模型需要大规模的同步计算集群。这些工作负载在地理上是灵活的，但在整体规模上是能源密集的。它们代表了AI时代的“工厂”。
* 规模：到2030年，单个前沿训练运行预计需要4-10 GW的专用电力容量。[^1] 这一规模超过了大多数单个发电厂的发电能力，需要连接到高压输电骨干网或专用反应堆集群。
* 地理位置：由于训练期间对最终用户的延迟无关紧要（模型尚未上线），这些“AI工厂”可以位于拥有廉价、丰富电力的偏远地区。我们看到向“搁浅资产”迁移的趋势——拥有太阳能阵列的沙漠、拥有过剩水电能力的地区或与核电站共址——在那里的土地和电力更便宜，即使到人口中心的网络延迟很高。
* 电网影响：它们充当巨大的、稳定的基本负载消费者。与昼夜波动的住宅或商业负载不同，训练集群一次运行数月，利用率接近100%。这种平坦的负载曲线实际上对公用事业公司来说是有吸引力的稳定收入来源，前提是存在能够输送千兆瓦电力的传输基础设施。
#### 1.2.2 推理：分布式的洪水
推理——查询模型的过程——是“墙”变得普遍且难以管理的地方。
* 规模：单个ChatGPT查询消耗约2.9 Wh，大约是标准谷歌搜索（0.3 Wh）能量的十倍。[^6] 当扩展到“智能体”工作流——即AI在回答之前循环、推理和反思——时，每个查询的能源成本激增13倍至超过4 Wh。[^8]
* 地理位置：推理对延迟敏感。它必须发生在离用户更近的地方，即电力最受限和昂贵的城市边缘数据中心。与AI智能体互动的用户期望近乎即时的响应；因此，计算不能位于偏远的沙漠，而必须驻留在北弗吉尼亚、硅谷或法兰克福。
* “做梦”负载：新兴架构表明，AI系统可能很快会超越静态的“查询-响应”模型，进入持续的“做梦”或“整合”阶段。像Pattern Computer (PCM)这样的技术表明，系统可以在停机期间整合记忆并优化几何结构，类似于生物睡眠。[^9] 这将从根本上改变推理负载曲线，将曾经突发的昼夜负载转变为持续的24/7能源需求，消除公用事业公司依赖的用于电网平衡的电力消耗“低谷”。
* 预测：虽然训练占据了头条新闻，但推理是长期的能源驱动力。到2030年，随着模型集成到数十亿边缘设备和企业工作流中，推理预计在总能耗方面将超过训练。[^10]
表1：AI工作负载的能源概况（2025-2030预测）

| 指标 | AI 训练 | AI 推理 |
| :--- | :--- | :--- |
| **主要约束** | 总发电能力 (GW) | 延迟与本地电网容量 |
| **功率密度** | 极高 (每机架100kW+) | 高到中等 (20-50kW) |
| **地理灵活性** | 高 (可远程) | 低 (必须靠近用户) |
| **能源行为** | 持续数月的巨大负载 | 突发、昼夜 (随“做梦”智能体转变为持续) |
| **2030能源份额** | ~AI能源的40% | ~AI能源的60% [^10] |
| **电网互动** | 传输级连接 | 配电级 / 城市边缘连接 |
### 1.3 排热极限
热力学规定，处理器消耗的所有能量最终都会转化为热量。一个100 MW的数据中心实际上就是一个100 MW的加热器。移除这些热量的效率由电源使用效率（PUE）衡量，但PUE仅衡量总功率与IT功率的比率；它并不能解决热传递密度的物理问题。
风冷的失败：在每机架30-40 kW以上的密度下，风冷在物理上变得不切实际。空气的热容量很低（$C_p \approx 1.005$ J/g·K）。为了用空气带走100kW机架产生的热量，所需的气流量体积要求风扇以消耗过多能量（寄生负载）的速度运行，并产生可能损坏硬盘和敏感组件的危险声学振动。[^11] 如果不将入口温度降低到会导致冷凝问题的水平，所需的“Delta T”（温差）将变得无法管理。
液体转型：这一物理极限正在推动向液冷的强制迁移。水的比热容约为空气的4倍（$C_p \approx 4.18$ J/g·K），导热率约为空气的24倍。
* 直接芯片（DTC）：冷板直接位于GPU/CPU上。这捕获了约70-80%的热量，其余由空气带走。这是超大规模企业当前的标准。[^12] 它允许“温水冷却”，入口温度可达40°C+，显着提高了干式冷却器的效率并减少了对机械冷水机的需求。
* 浸没式冷却：将整个服务器浸入介电液中。这捕获了近100%的热量并消除了风扇，将服务器功耗降低了10-15%。[^13] 虽然在热力学上更优越，但由于维护浸没硬件的麻烦和介电液的成本，它面临采用障碍。
* 市场转变：液冷市场预计到2030年将以超过20%的年复合增长率增长，几乎完全由AI密度要求驱动。[^11] 这不是一种偏好，而是一种要求；风冷根本无法支持H100和B200一代芯片的物理特性。
---
## 第2部分：物理约束——电网与“通电时间”
虽然热量可以通过液冷等工程解决方案来管理，但电力必须有来源。这正是AI行业面临的最坚硬、最不可移动的墙：美国电网。电网是发电、输电和配电的复杂机器，目前未能跟上AI的指数级需求。
### 2.1 互连队列积压
美国电网正在经历前所未有的拥堵。“互连队列”——新发电和大型负载连接等待批准并物理连接到电网的等候名单——已成为数据中心发展的主要瓶颈。截至2024年底，有超过2,600 GW的发电和储能项目在互连队列中等待——是该国现有装机容量的两倍多。[^3]
* 等待时间：项目从互连请求到商业运营的平均时间已从2008年的不到2年激增至2024年的5年以上。3 在像PJM（覆盖世界数据中心之都北弗吉尼亚州）这样的受限市场，等待时间可能会延长到2028年或2030年。
* 损耗：队列中充满了投机项目。完成率正在暴跌。在2000年至2018年间进入队列的项目中，只有约19%实际达到了商业运营。[^3] 这种高失败率阻塞了研究过程，因为每当一个项目退出时，电网运营商必须重新研究剩余项目的影响，导致级联延迟。
* 数据中心影响：数据中心现在是负载增长预测的主要驱动力。仅仅四年时间，电力需求增长的五年预测就增加了六倍。[^15] 这种激增导致公用事业公司对新连接实施“暂停”，迫使开发商寻找替代地点或替代电源。
### 2.2 “通电时间”作为新货币
对于超大规模企业（微软、亚马逊、谷歌、Meta）而言，“通电时间”这一指标已取代成本。将AI集群部署推迟两年的机会成本，是在通往通用人工智能（AGI）竞赛中损失的数十亿美元市场份额。
* 溢价：数据中心领导者现在愿意为能够快速部署、绕过公用事业队列的电力解决方案支付50%的溢价。[^16] 这改变了选址的经济计算。以前每千瓦时的价格是决定因素，现在“通电日期”至高无上。
* 转向现场发电：由于电网太慢，运营商实际上正在走向“离网”或“混合”。到2030年，估计30%的数据中心将使用现场电力作为主要来源。[^17] 这代表了公用事业模式的根本破裂，大型工业客户为了生存而脱离集中式电网。
* 天然气桥梁：这一趋势的直接受益者是天然气。燃料电池（如Bloom Energy的产品）和燃气轮机可以在12-18个月内部署，而输电升级需要5-8年。例如，微软正在试点由天然气燃料电池直接供电的数据中心，以绕过传输损耗和延迟。[^18] 谷歌正在资助配备碳捕获和存储（CCS）的天然气发电厂，以确保24/7稳定的电力，同时试图实现气候目标。[^19] 这种“孤岛模式”策略是对电网惯性现实的务实妥协。
### 2.3 “搁浅电力”悖论
尽管短缺，现有数据中心中仍有大量电力是“搁浅”的——已供应但未使用。这种低效是保守工程和传统基础设施无法适应动态负载的副产品。
* 缓冲：为了确保可靠性，运营商通常会过度供应电力，为很少以100%利用率运行的机架分配铭牌容量。这留下了40-50%的闲置容量作为应对尖峰的安全缓冲。[^20]
* 机会：这种低效催生了软件定义电力（SDP）。像Virtual Power Systems (VPS)的智能能源控制（ICE）等技术使用机器学习来动态分配电力，允许运营商安全地“超额认购”其基础设施。通过识别这种搁浅容量，SDP可以在相同的物理电力范围内解锁30-50%以上的计算密度。[^21]
* 机制：SDP为电力创建了一个虚拟化层，类似于VMware虚拟化服务器。它允许数据中心定义“电力优先级”，在峰值期间切断非必要工作负载（如批处理或开发环境）的电力，以确保关键任务AI推理继续运行。这种弹性对于驾驭推理工作负载的“突发”性质至关重要。
---
## 第3部分：能源来源——核能梦想与地质现实
该行业声称的应对热力学之墙的长期解决方案是核能，特别是小型模块化反应堆（SMR）。其愿景是优雅的：小型、工厂制造的反应堆与数据中心共址，提供无碳、始终在线的基本负载电力。然而，深入研究分析揭示了未来十年内的炒作与运营现实之间存在巨大差距。
### 3.1 SMR的承诺与企业押注
小型模块化反应堆承诺工厂化制造核电，降低成本和部署时间。科技巨头已发出巨大兴趣信号，试图通过信号需求来启动供应链：
* 谷歌：与Kairos Power合作，到2035年部署500 MW的熔盐反应堆。23
* 亚马逊 (AWS)：投资X-energy以便在华盛顿州部署，并从Talen Energy购买核动力数据中心园区。[^23]
* 微软：专注于重启三哩岛1号机组，为其AI运营提供专用基本负载电力。[^23]
### 3.2 现实检验：NuScale与经济学
2023年末NuScale“无碳电力项目”（CFPP）的崩溃是该行业的一个重要警示故事。NuScale是行业的领跑者，也是唯一获得美国核管理委员会（NRC）批准的SMR设计。
* 失败：项目被取消是因为签约购买电力的客户（市政公用事业）太少。目标电价从58美元/MWh上升到89美元/MWh，使其与风能、太阳能和天然气相比没有竞争力。[^25]
* 根本原因：失败是由大宗商品价格（钢铁、混凝土）上涨和高利率驱动的，这惩罚了资本密集型核项目。它暴露了“规模经济”的劣势：SMR失去了大型反应堆的效率，但仍需承担高昂的监管和安全管理费用。[^26] 通过工厂学习曲线降低成本的“模块化”承诺尚未得到证实，因为目前还没有工厂存在。
### 3.3 燃料墙：HALEU短缺
也许最关键但讨论不足的限制是燃料本身。大多数先进的SMR设计（包括X-energy和TerraPower的设计）都需要高纯度低浓缩铀（HALEU），浓缩度为5-20%的U-235。标准反应堆使用3-5%的低浓缩铀（LEU）。
* 垄断：历史上，俄罗斯（通过Tenex）是世界上唯一的HALEU商业供应商。乌克兰入侵后的地缘政治破裂切断了这一供应链，使西方SMR开发商失去了燃料来源。[^2]
* 国内缺口：美国实际上没有商业HALEU产能。作为美国唯一的许可证持有者，Centrus Energy直到2023年末才在其俄亥俄州派克顿的设施开始试点生产。它在2024年仅生产了900公斤，而DOE预测到2030年需求为40,000公斤/年。2
* 含义：没有燃料，SMR无法部署。开发国内浓缩供应链需要多年的许可和数十亿美元的资金。这一燃料瓶颈将SMR广泛采用的现实时间表推迟到了2030年之后，可能进入2035-2040年窗口。[^28] 因此，SMR不是当前5-10年热力学之墙的解决方案；它们是下一个周期的解决方案。
---
## 第4部分：杠杆——基础设施不对称
鉴于电网升级和核能部署缓慢（5-10年），行业必须在“快速”基础设施中寻找杠杆。这涉及优化电网和芯片之间的层级，利用技术可以比混凝土和物理学移动得更快的的不对称性。

```infographic leverage
leverage
```






### 4.1 互连瓶颈：共封装光学（CPO）
随着GPU集群扩展到100,000+个单元，网络变成了计算机。然而，在芯片之间移动数据消耗了总电力预算中越来越大的比例。
* 问题：传统的可插拔光学模块（收发器）正在触及效率墙。随着速度增加到800G和1.6T，仅将数据从交换机ASIC移动到前面板所需的电能（“SerDes”功率）变得不可持续。[^29] 可插拔光学器件消耗约15-20 pJ/bit。
* 解决方案：共封装光学（CPO）将光学引擎直接移动到与交换机ASIC相同的封装上，用光代替铜迹线。
   * 杠杆：CPO将功耗降低了50%以上（至<5 pJ/bit），并消除了对耗电重定时器的需求。[^29]
   * 采用：像Broadcom和Nvidia这样的主要参与者正在向下一代AI交换机（51.2 Tbps及以上）过渡到CPO。这是一个关键的杠杆点：升级网络架构节省的电力可以重新定向到计算。[^31]
### 4.2 硅光子学（SiPh）
硅光子学是启用CPO的底层技术。通过使用标准CMOS半导体工艺制造光学组件，SiPh允许将激光器和调制器直接集成到硅芯片上。[^32]
* 影响：SiPh实现了GPU的“光学I/O”，允许处理器以光带宽但以芯片密度进行通信。这有效地打破了“内存墙”，允许分解内存架构，其中GPU可以像访问本地内存一样快地访问远程内存。[^33] 像DustPhotonics和意法半导体这样的公司正在推动这种效率，将收发器的尺寸缩小30%，功耗降低20%。[^33]
### 4.3 布线革命：AEC vs. DAC vs. AOC
在机架内部，一场关于布线的悄然革命正在发生，以节省电力和空间。电缆的选择决定了气流、功耗和覆盖范围。
表2：数据中心布线技术比较

| 特性 | DAC (直连铜缆) | AEC (有源电缆) | AOC (有源光缆) |
| :--- | :--- | :--- | :--- |
| **功耗** | 零 (无源) [^34] | 低 (每端~1-2W) [^35] | 中/高 (每端2W+) [^34] |
| **覆盖范围 (在400G+)** | 短 (<3 米) | 中 (5-7 米) | 长 (100m+) |
| **成本** | 最低 | 中等 (中间地带) | 最高 |
| **气流影响** | 笨重，粗线径阻碍气流 | 较细线径，气流更好 | 最细，气流最好 |
| **用例** | 机架顶部 (ToR) | 机架间 / 行内 | 跨大厅 / 长途 |
	* AEC (有源电缆)：AI集群的“恰到好处”解决方案。它使用铜，但包括重定时器芯片来清洁信号。
   * 杠杆：AEC将铜缆覆盖范围扩展到5-7米（跨越多个机架），成本低于光学器件，线径比无源铜缆更细（改善气流）。[^35] 它们正在成为连接行内AI加速器的标准，因为DAC太短，而AOC太昂贵/耗电。
### 4.4 冷却剂分配单元（CDU）
冷却剂分配单元（CDU）已成为关键的杠杆。它是液冷回路的“心脏”，管理冷却剂的流量、压力和温度。[^36]
* 市场动态：CDU市场正在爆炸式增长，预计将从2024年的8.87亿美元增长到2032年的36亿美元，年复合增长率为20%。[^37]
* 技术：高效CDU允许“温水冷却”（使用40°C+的水），这消除了对能源密集型冷水机的需求，允许即使在炎热气候下也能通过干式冷却器排热。这显著降低了总数据中心PUE。[^38]
* 快速断开连接（UQD）：“液冷的USB”。防漏快速断开接头（如CPC、Danfoss、Stäubli的OCP兼容UQD）的标准化对于大规模实施液冷至关重要。没有可靠的UQD，维护液冷机架就是排放和重新填充液体的后勤噩梦。UQD市场正在激增，因为它们成为要避免的关键故障点。[^39]
### 4.5 数据压缩：“做梦”的杠杆
除了硬件之外，数据缩减中也存在软件杠杆。Atombeam和Neurpac利用“码字”在源头压缩数据，在不牺牲准确性的情况下优化带宽。[^9]
* “做梦”概念：如“AI做梦”片段所述，利用PCM（Pattern Computer）架构的未来AI系统可能会在“睡眠”周期中整合模式。[^9] 这将热力学负载从持续的研磨变为有节奏的循环，可能允许系统在非高峰时段优化其内部几何结构，使计算需求与可再生能源可用性（例如夜间的风能）保持一致。
---
## 第5部分：最佳策略——“绿色计算”论点（2025）
基于这些力量的碰撞，我们提出了2025年的战略框架：“绿色计算”论点。该策略超越了肤浅的ESG目标，转向在电力受限的世界中的运营生存。它采用“行星森林”模型——一种分布式、弹性和生物启发的途径——而不是“巴别塔”中心化扩展模型。[^4]

```infographic strategy
strategy
```






### 5.1 策略1：效率即新容量
在电网电力受限的情况下，扩展计算的唯一方法是从同一瓦特中提取更多操作。
* 行动：积极部署软件定义电力（SDP）。数据中心必须从静态供应（搁浅40%的电力）转向动态、超额认购模型。这实际上是通过软件恢复的“免费”容量。像Virtual Power Systems和Uplight这样的公司是这里的关键推动者。[^21]
* 行动：强制所有新AI集群构建采用共封装光学。网络层节省50%的电力是为GPU释放电力的少数可用杠杆之一。[^29]
### 5.2 策略2：“孤岛模式”转向
依赖公用事业电网现在是一个战略风险。“孤岛模式”策略涉及建设可以独立或半独立于电网运行的数据中心。
* 行动：部署带碳捕获的天然气或固体氧化物燃料电池（Bloom Energy）作为主要电力。虽然今天不是零碳，但这提供了电网无法比拟的“通电时间”速度（9-12个月）。[^17]
* 行动：确保拥有现有发电厂“表后”接入的土地（例如，与核电站或燃气电厂共址），以避免传输队列。亚马逊购买Talen Energy核动力数据中心是这一举措的原型。[^24]
### 5.3 策略3：冷却改造
现有的风冷设施对于AI资产正变得过时。
* 行动：大规模投资液对气CDU。这些单元允许通过将液体回路的热量排放到房间的气流中（由现有CRAC管理），在风冷数据中心部署液冷机架。这是在完全液体设施上线之前，2025-2028年的桥梁技术。[^41]
* 行动：标准化通用快速断开连接（UQD），以使基础设施面向未来并防止供应商锁定。
### 5.4 策略4：造林方法（“森林模型”）
借鉴“认知的造林架构”，最佳策略拒绝“巴别塔”模型（无限中心化），支持“行星森林”。[^4]
* 行动：分布式推理。将推理工作负载推向边缘。与其集中所有计算，不如利用电信塔和城市数据中心的分布式电力容量进行推理。这需要较小的、专门的模型而不是单体LLM，模仿生物系统的效率（人脑20瓦特 vs AI千兆瓦）。[^4]
* 行动：有机数据耕作。认识到人类数据是AI森林的“腐殖质”。投资于保存和验证真实人类数据的系统，以防止“数字近亲繁殖”和模型崩溃。[^4]
---
## 结论：墙作为过滤器
热力学之墙不是终结AI进步的硬性停止。相反，它是一个进化过滤器。它将扼杀低效的架构和投机的“僵尸”项目。暴力扩展的时代——将更多H100投入由压力巨大的电网供电的风冷机架——已经结束。
未来5-10年将由架构的优雅定义：
1. 热优雅：用液体（CDU）移动热量，而不是空气。
2. 光学优雅：用光子（硅光子学）移动数据，而不是电子。
3. 能量优雅：现场发电（燃料电池）并用软件（SDP）管理它。
对于投资者和战略家来说，阿尔法不在于GPU制造商（面临商品化），而在于热力学之墙的“镐和铁锹”：CDU、UQD、硅光子学、AEC和SMR燃料链的制造商。这些是允许翻越这堵墙的技术。AI与物理学之间的碰撞将是2020年代后期的决定性工业叙事，迫使数字世界最终尊重物理世界的定律。
表3：“绿色计算”投资矩阵（2025-2030）

| 部门 | “买入”论点（杠杆） | “卖出” / 风险论点 | 主要参与者 |
| :--- | :--- | :--- | :--- |
| **冷却** | 液体CDU和UQD。>50kW机架必不可少。配件/流体的经常性收入。 | 传统CRAC/CRAH。风冷对于前沿AI已死。 | Vertiv, nVent, CPC, Stäubli, CoolIT, DCX |
| **发电** | 燃料电池和燃气轮机。唯一的“快速”电力。 | SMR（短期）。HALEU短缺和监管延迟推至2030+。 | Bloom Energy, Mitsubishi, Centrus（长期） |
| **互连** | 硅光子学 (CPO) 和 AEC。解决I/O功率瓶颈。 | 可插拔收发器（长距离）。对于集群内来说太耗电。 | Broadcom, Marvell, DustPhotonics, Credo |
| **软件** | 软件定义电力。解锁30%“免费”容量。 | 传统DCIM。被动监控是不够的；需要控制。 | Virtual Power Systems, Uplight |
| **电网** | 传输组件。变电站的变压器/开关设备。 | 投机性太阳能/风能。互连队列扼杀IRR。 | Eaton, Siemens, Hubbell |


## 引用文献
[^1]: AI 2030 - final version - Epoch AI, accessed December 21, 2025, https://epoch.ai/files/AI_2030.pdf
[^2]: Centrus Reaches 'Critical Milestone' With 900 Kilogram Haleu ..., accessed December 21, 2025, https://www.nucnet.org/news/centrus-reaches-critical-milestone-with-900-kilogram-haleu-delivery-to-us-doe-6-1-2025
[^3]: Clean Energy Interconnection Backlog—2025 Trends & Insights, accessed December 21, 2025, https://www.zeroemissiongrid.com/insights-press-zeg-blog/interconnection-backlog/
[^4]: (PDF) The Silvicultural Architecture of Cognition - ResearchGate, accessed December 21, 2025, https://www.researchgate.net/publication/398664899_The_Silvicultural_Architecture_of_Cognition
[^5]: ENVIRONMENTAL IMPACTS OF ARTIFICIAL INTELLIGENCE, accessed December 21, 2025, https://www.oeko.de/fileadmin/oekodoc/Report_KI_ENG.pdf
[^6]: Electricity Demand and Grid Impacts of AI Data Centers - arXiv, accessed December 21, 2025, https://arxiv.org/html/2509.07218v4
[^7]: AI power: Expanding data center capacity to meet growing demand, accessed December 21, 2025, https://www.mckinsey.com/industries/technology-media-and-telecommunications/our-insights/ai-power-expanding-data-center-capacity-to-meet-growing-demand
[^8]: Research summary - Ethan Wicker, accessed December 21, 2025, https://ethanwicker.com/2025-10-07-research-summary-energy-use-of-ai-inference/
[^9]: Invest in Atombeam | StartEngine, accessed December 21, 2025, https://www.startengine.com/offering/atombeam
[^10]: Chipping Point - Greenpeace, accessed December 21, 2025, https://www.greenpeace.org/static/planet4-eastasia-stateless/2025/04/5011514f-greenpeace_chipping_point.pdf
[^11]: Data Center Liquid Cooling Market Outlook and Forecast 2025-2030, accessed December 21, 2025, https://www.marknteladvisors.com/research-library/data-center-liquid-cooling-market.html
[^12]: Data Center Liquid Cooling Market Size, Companies & Share Analysis, accessed December 21, 2025, https://www.mordorintelligence.com/industry-reports/data-center-liquid-cooling-market
[^13]: Data Center Liquid Cooling Market | Size, Share, Growth | 2025 - 2030, accessed December 21, 2025, https://virtuemarketresearch.com/report/data-center-liquid-cooling-market
[^14]: The US interconnection queue is twice its installed capacity, accessed December 21, 2025, https://www.latitudemedia.com/news/the-us-interconnection-queue-is-twice-its-installed-capacity/
[^15]: Power Demand Forecasts Revised Up - Grid Strategies, accessed December 21, 2025, https://gridstrategiesllc.com/wp-content/uploads/Grid-Strategies-National-Load-Growth-Report-2025.pdf
[^16]: Data center executives pivot toward onsite power, per new report, accessed December 21, 2025, https://www.power-eng.com/onsite-power/data-center-executives-pivot-toward-onsite-power-per-new-report/
[^17]: Reliable Data Center Power Solutions - Bloom Energy, accessed December 21, 2025, https://www.bloomenergy.com/industries/data-center-power/
[^18]: Microsoft to Build Data Center Powered by Gas Fuel Cells, accessed December 21, 2025, https://www.power-eng.com/gas/turbines/microsoft-to-build-data-center-powered-by-gas-fuel-cells/
[^19]: Google signs first contract to capture emissions at natural gas plant, accessed December 21, 2025, https://trellis.net/article/google-funding-new-natural-gas-plant-outfitted-carbon-capture-storage/
[^20]: Top 40 Data Center KPIs, accessed December 21, 2025, https://img.datacenterfrontier.com/files/base/ebm/datacenterfrontier/document/2022/09/1663627559004-eb016_sunbird_ebook_top_40_data_center_kpis.pdf?dl=1663627559004-eb016_sunbird_ebook_top_40_data_center_kpis.pdf
[^21]: VPS CEO Dean Nelson on Flipping Data Centers' Wasteful Status Quo, accessed December 21, 2025, https://www.datacenterknowledge.com/sustainability/vps-ceo-dean-nelson-on-flipping-data-centers-wasteful-status-quo
[^22]: Virtual Power Systems Software Defined Power Selected by SAP, accessed December 21, 2025, https://eepower.com/news/virtual-power-systems-software-defined-power-selected-by-sap/
[^23]: Big Tech's Nuclear Bet: Key Small Modular Reactors for Cloud Power, accessed December 21, 2025, https://www.wwt.com/blog/big-techs-nuclear-bet-key-small-modular-reactors-for-cloud-power
[^24]: Executive Summary – The Path to a New Era for Nuclear Energy - IEA, accessed December 21, 2025, https://www.iea.org/reports/the-path-to-a-new-era-for-nuclear-energy/executive-summary
[^25]: NuScale cancels first planned SMR nuclear project due to lack of ..., accessed December 21, 2025, https://www.thechemicalengineer.com/news/nuscale-cancels-first-planned-smr-nuclear-project-due-to-lack-of-interest/
[^26]: The collapse of NuScale's project should spell the end for small ..., accessed December 21, 2025, https://www.utilitydive.com/news/nuscale-uamps-project-small-modular-reactor-ramanasmr-/705717/
[^27]: Building Fuel Supply Chains for SMRs and Advanced Reactors, accessed December 21, 2025, https://www.iaea.org/bulletin/fuelling-the-future-building-fuel-supply-chains-for-smrs-and-advanced-reactors
[^28]: High-Assay Low-Enriched Uranium (HALEU), accessed December 21, 2025, https://world-nuclear.org/information-library/nuclear-fuel-cycle/conversion-enrichment-and-fabrication/high-assay-low-enriched-uranium-haleu
[^29]: A Key Technology Path for Optical Interconnects in AI Data Centers, accessed December 21, 2025, https://www.naddod.com/blog/cpo-optical-interconnects-in-ai-data-centers
[^30]: Energy Efficiency in Co-Packaged Optics, accessed December 21, 2025, https://www.senko.com/energy-efficiency-in-co-packaged-optics/
[^31]: Co-Packaged Optics in Modern Data Centres - ahmedjama.com, accessed December 21, 2025, https://ahmedjama.com/blog/2025/05/co-packaged-optics-in-modern-datacenter
[^32]: How silicon photonics is powering the AI data center revolution, accessed December 21, 2025, https://blog.st.com/data-silicon-photonics-ai/
[^33]: Silicon Photonics for Data Centers | DustPhotonics, accessed December 21, 2025, https://www.dustphotonics.com/unlocking-the-potential-of-silicon-photonics/
[^34]: DAC vs AOC Cables: Complete 2025 Data Center Guide (with AEC), accessed December 21, 2025, https://network-switch.com/blogs/networking/dac-vs-aoc-cables-the-guide-2025
[^35]: Active Electrical Cables (AEC): Enabling High-Speed Connectivity, accessed December 21, 2025, https://www.fs.com/blog/active-electrical-cables-aec-enabling-highspeed-connectivity-41201.html
[^36]: CDUs: Enabling High-Density Cooling for AI Data Centers, accessed December 21, 2025, https://airsysnorthamerica.com/behind-every-ai-breakthrough-the-cdu-technology-enabling-high-density-cooling/
[^37]: Coolant Distribution Units CDU for Data Center Market Outlook 2025 ..., accessed December 21, 2025, https://www.intelmarketresearch.com/coolant-distribution-units-for-data-center-2025-2032-386-4497
[^38]: Coolant Distribution Units (CDU) for Data Center Market Size, accessed December 21, 2025, https://reports.valuates.com/market-reports/QYRE-Auto-13Y17027/global-coolant-distribution-units-cdu-for-data-center
[^39]: The Soaring Rise of Universal Quick Disconnect (UQD) Couplings, accessed December 21, 2025, https://www.intelmarketresearch.com/blog/60/universal-quick-disconnect-coupling-for-liquid-cooling-market
[^40]: Virtual Power Plant Solutions - Uplight, accessed December 21, 2025, https://uplight.com/solutions/virtual-power-plant/
[^41]: Understanding Coolant Distribution Units (CDUs) for Liquid Cooling, accessed December 21, 2025, https://www.vertiv.com/en-us/about/news-and-insights/articles/educational-articles/understanding-coolant-distribution-units-cdus-for-liquid-cooling/