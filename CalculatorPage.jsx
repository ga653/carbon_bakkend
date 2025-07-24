import axios from "axios";
import { Layout, Menu, Steps, Form, Select, Input, Button, Table, Radio, Card} from 'antd';
import { MenuFoldOutlined, MenuUnfoldOutlined } from '@ant-design/icons';
import React, { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, Legend, Tooltip } from 'recharts';
import './CalculatorPage.css';

const { Content, Sider } = Layout;

// 小數格式顯示：整數不顯示小數，其他保留 4 位
const formatNumber = (num) => {
  const floatNum = parseFloat(num);
  return Number.isInteger(floatNum)
    ? floatNum.toString()
    : floatNum.toFixed(4);
};

const steps = [
  { title: '輸入排放來源' },
  { title: '確認排放係數類型' },
  { title: '試算結果與統計分析' },
];

const rawMaterialData = {
  "燃油": [
    { label: '50001 - 原油', value: '50001' },
    { label: '50004 - 液化天然氣', value: '50004' },
    { label: '170001 - 車用汽油', value: '170001' },
    { label: '170002 - 航空汽油', value: '170002' },
    { label: '170004 - 航空燃油', value: '170004' },
    { label: '170005 - 煤油', value: '170005' },
    { label: '170006 - 柴油', value: '170006' },
    { label: '170008 - 燃料油', value: '170008' },
    { label: '170010 - 潤滑油', value: '170010' },
    { label: '170011 - 石油腦(輕油)', value: '170011' },
    { label: '170017 - 柏油(瀝青)', value: '170017' },
    { label: '170019 - ４～６號重油', value: '170019' },
    { label: '170029 - 石油焦', value: '170029' },
    { label: '170036 - 石油腦(重油)', value: '170036' },
    { label: '350008 - 液化石油氣', value: '350008' },
    { label: 'GG1702 - 燃料－奧里油', value: 'GG1702' },
    { label: 'GG1799 - 其他油品', value: 'GG1799' }
  ],
  "燃氣": [
    { label: '50002 - 天然氣', value: '50002' },
    { label: '180178 - 乙烷', value: '180178' },
    { label: '350014 - 煉焦爐氣', value: '350014' },
    { label: '350016 - 精煉油氣', value: '350016' },
    { label: '350017 - 高爐氣', value: '350017' }
  ],
  "燃煤": [
    { label: '70001 - 泥煤', value: '70001' },
    { label: '70002 - 褐煤', value: '70002' },
    { label: '70003 - 煙煤', value: '70003' },
    { label: '70004 - 半煙煤', value: '70004' },
    { label: '70005 - 無煙煤', value: '70005' },
    { label: '170028 - 焦炭', value: '170028' },
    { label: 'GG0700 - 燃料－煤球', value: 'GG0700' },
    { label: 'GG0701 - 燃料－油頁岩', value: 'GG0701' },
    { label: 'GG0702 - 燃料－焦煤', value: 'GG0702' },
    { label: 'GG0703 - 燃料－原料煤', value: 'GG0703' },
    { label: 'GG0704 - 燃料－自產煤', value: 'GG0704' }
  ],
  "電力": [
    { label: '350099 - 其他電力', value: '350099' },
    { label: 'GG3502 - REC登載電力使用-電證合一', value: 'GG3502' },
    { label: 'GG3505 - 再生能源(自發自用)', value: 'GG3505' }
  ],
  "製程": [
    { label: '60013 - 白雲石', value: '60013' },
    { label: '180139 - 碳酸鈉(純鹼)', value: '180139' },
    { label: '180140 - 碳酸鉀', value: '180140' },
    { label: '180143 - 碳酸鋇', value: '180143' },
    { label: '180144 - 碳酸鎂', value: '180144' },
    { label: '180146 - 碳酸氫鈉(小蘇打)', value: '180146' },
    { label: '180191 - 乙炔', value: '180191' },
    { label: '180365 - 尿素(肥料用)', value: '180365' },
    { label: '230238 - 石灰石(CaCO3）', value: '230238' },
    { label: '240024 - 低碳棒盤元', value: '240024' }
  ],
  "逸散/含氟氣體": [
    { label: '180014 - 二氧化碳', value: '180014' },
    { label: '180122 - 六氟化硫', value: '180122' },
    { label: '180123 - 三氟化氮', value: '180123' },
    { label: '180176 - 石化甲烷', value: '180176' },
    { label: '180177 - 甲烷', value: '180177' },
    { label: 'GG1802 - 氣體－氧化亞氮', value: 'GG1802' },
    { label: 'GG1803 - PFC-14， 四氟化碳，CF4', value: 'GG1803' },
    { label: 'GG1804 - PFC-116，六氟乙烷，C2F6', value: 'GG1804' },
    { label: 'GG1808 - C4F8，八氟環丁烷', value: 'GG1808' },
    { label: 'GG1809 - C3F8，全氟丙烷', value: 'GG1809' },
    { label: 'GG1829 - HFC-227ea，七氟丙烷，CF3CHFCF3', value: 'GG1829' },
    { label: 'GG1835 - HFC-134a/R-134a，1,1,1,2-四氟乙烷，CH2FCF3', value: 'GG1835' },
    { label: 'GG1838 - HFC-41一氟甲烷，CH3F', value: 'GG1838' },
    { label: 'GG1839 - HFC-32/R-32二氟甲烷，CH2F2', value: 'GG1839' },
    { label: 'GG1840 - HFC-23/R-23三氟甲烷，CHF3', value: 'GG1840' },
    { label: 'GG1878 - R-507A，HFC-125/HFC-143a (50.0/50.0)', value: 'GG1878' }
  ],
};

const materialOptions = Object.fromEntries(
  Object.entries(rawMaterialData).map(([category, items]) => [
    category,
    items.map(item => {
      const nameOnly = item.label.split(' - ')[1]; 
      return { label: nameOnly, value: item.value };
    })
  ])
);

// 排放來源 ➔ 對應範疇別
const scopeMap = {
  燃油: '直接',
  燃氣: '直接',
  燃煤: '直接',
  電力: '間接',
  製程: '直接',
  '逸散/含氟氣體': '直接' 
};

const typeMap = {
  "燃油": "燃料燃燒",
  "燃氣": "燃料燃燒",
  "燃煤": "燃料燃燒",
  "電力": "電力",
  "製程": "製程",
  "逸散/含氟氣體": "逸散"
};

const gasNameMap = {
  CO2: "CO₂",
  CH4: "CH₄",
  N2O: "N₂O",
  HFCs: "HFCs",
  PFCs: "PFCs",
  SF6: "SF₆",
  NF3: "NF₃",
  N2: "N₂",
};

const App = () => {
  const [collapsed, setCollapsed] = useState(true); // 預設收合
  const [current, setCurrent] = useState(0);
  const [source, setSource] = useState(null); // ⭐ 抓取「排放來源」目前選什麼
  const [scope, setScope] = useState('');        // ⭐範疇別
  const [form] = Form.useForm();
  const [results, setResults] = useState(null);
  const [rows, setRows] = useState([]); // 改為支援多列資料
  const [serialCounter, setSerialCounter] = useState(1);
  const [suggestionText, setSuggestionText] = useState('');
  const [loadingSuggestion, setLoadingSuggestion] = useState(false);
  const [showMobileSource, setShowMobileSource] = useState(false);
  const mobileFuelCodes = ['50004', '170001', '170002', '170004', '170005', '170006', '350008'];
  
  useEffect(() => {
    if (current === 3 && rows.length > 0 && !suggestionText) {
      handleGenerateSuggestion(); // ✅ 這一段會自動觸發 API
    }
  }, [current]);

  const pieData = [
    { name: '固定', value: rows.reduce((sum, row) => row.type === '燃料燃燒' ? sum + parseFloat(row.emissionCO2e) : sum, 0) },
    { name: '製程', value: rows.reduce((sum, row) => row.type === '製程' ? sum + parseFloat(row.emissionCO2e) : sum, 0) },
    { name: '移動', value: rows.reduce((sum, row) => row.type === '移動' ? sum + parseFloat(row.emissionCO2e || 0) : sum, 0) },
    { name: '逸散', value: rows.reduce((sum, row) => row.type === '逸散' ? sum + parseFloat(row.emissionCO2e) : sum, 0) },
    { name: '電力', value: rows.reduce((sum, row) => row.type === '電力' ? sum + parseFloat(row.emissionCO2e) : sum, 0) },
  ];

  const COLORS = ['#3b82f6', '#ec4899', '#10b981', '#f59e0b', '#06b6d4'];

const exportToCSV = () => {
  const headers = [
    '序號','範疇別','排放型式','原物料代碼','原燃物料名稱',
    '產生CO2','產生CH4','產生N2O','產生HFC','產生PFC','產生SF6','產生NF3',
    '活動數據','活動數據單位','屬生質能源','排放當量(公噸CO2e/年)','生質排放當量(公噸CO2e/年)'
  ];

  const rowsToExport = rows.map(row => [
    row.serial, row.scope, row.type, row.code, row.name,
    row.co2, row.ch4, row.n2o, row.hfcs, row.pfcs, row.sf6, row.nf3,
    row.activityData, row.unit, row.isBiomass, row.emissionCO2e, row.biomassEmission
  ]);

  const csvContent = [headers, ...rowsToExport]
    .map(e => e.map(field => `"${field ?? ''}"`).join(','))
    .join('\n');

  const blob = new Blob(["\uFEFF" + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `總排放來源清單_${new Date().toISOString().slice(0,10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};


  const handleDelete = (key) => {
    const newRows = rows.filter(row => row.key !== key);
    setRows(newRows);

    // 如果刪掉的是目前顯示的那筆 rowData
    if (results && results.rowData.key === key) {
      if (newRows.length > 0) {
        // 顯示剩下最後一筆的細節（或你可以改為顯示第一筆）
        const lastRow = newRows[newRows.length - 1];
        setResults({ rowData: lastRow, details: results.details, summary: results.summary });
      } else {
        // 沒有資料了就清除結果並回到第一步
        setResults(null);
        setCurrent(0);
      }
    }
  };

  const handleGenerateSuggestion = async () => {
    try {
      setLoadingSuggestion(true);
      const response = await axios.post("http://127.0.0.1:8000/api/generate_suggestion/", {
        summary: results.summary,
        rows: rows
      });

      const suggestion = response.data.suggestion;
      setSuggestionText(suggestion);
      console.log("建議內容：", suggestion);

    } catch (error) {
      console.error("產生建議失敗：", error);
      setSuggestionText("❌ 產生建議失敗，請稍後再試。");
    } finally {
      setLoadingSuggestion(false);
    }
  };



  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const { name, value } = payload[0];
      const total = pieData.reduce((sum, item) => sum + item.value, 0);
      const percent = total === 0 ? 0 : (value / total) * 100;
      const percentDisplay = `${percent.toFixed(2)}%`;

      return (
        <div style={{ background: '#1e293b', color: '#fff', padding: 10, borderRadius: 6, fontSize: 14 }}>
          <div style={{ fontWeight: 'bold', marginBottom: 4 }}>{name}</div>
          <div>總排放當量彙整 {percentDisplay}</div>
        </div>
      );
    }
    return null;
  };



  const next = () => setCurrent(current + 1);
  const prev = () => setCurrent(current - 1);

const handleFormSubmit = async (values) => {
  // ✅ 1. 檢查是否已有該代碼
  const isDuplicate = rows.some(row => row.code === values.materialCode);
  if (isDuplicate) {
    alert(`該筆資料已存在（代碼：${values.materialCode}）`);
    return; // ❌ 中止送出
  }

  try {
    const response = await axios.post('http://127.0.0.1:8000/api/calculate_emission/', {
      source: values.source,
      materialCode: values.materialCode,
      activityData: parseFloat(values.activityData.toString().replace(/,/g, '')),  // ✅ 修正格式化問題
      isBiomass: values.isBiomass,
      isMobileSource: values.isMobileSource,
    });

    console.log("後端回傳：", response.data);

    if (!response.data || !response.data.rowData || !response.data.details) {
      console.error('回傳資料格式錯誤:', response.data);
      return;
    }

    // ⭐⭐ 把 summary 也接回來 ⭐⭐
    const { rowData, details, summary } = response.data;

    rowData.key = serialCounter.toString();
    rowData.serial = serialCounter;
    rowData.emissionCO2e = parseFloat(rowData.emissionCO2e.toString().replace(/,/g, ''));
    rowData.biomassEmission = parseFloat(rowData.biomassEmission.toString().replace(/,/g, ''));

    // ✅ 自動判斷是否為移動燃燒源代碼，並根據使用者選「是」改為 type=移動
    const mobileFuelCodes = ['50004', '170001', '170002', '170004', '170005', '170006', '350008'];
    if (mobileFuelCodes.includes(values.materialCode) && values.isMobileSource === '是') {
      rowData.type = '移動';
    }

    setSerialCounter(prev => prev + 1);
    setRows(prev => [...prev, rowData]);

    setResults({ rowData, details, summary });

    console.log("設定當前步驟：1");
    setCurrent(1);

  } catch (error) {
    console.error('計算失敗:', error);
  }
};


  
  const total = rows.reduce((sum, row) => sum + parseFloat(row.emissionCO2e), 0);

  const typePercentages = {};
  rows.forEach(row => {
    const type = row.type;
    const value = parseFloat(row.emissionCO2e);
    if (!typePercentages[type]) typePercentages[type] = 0;
    typePercentages[type] += value;
  });

  // 轉為百分比、保留兩位小數
  Object.keys(typePercentages).forEach(type => {
    typePercentages[type] = total === 0
      ? '0.00'
      : ((typePercentages[type] / total) * 100).toFixed(2);
  });

  return (
    <Layout style={{ minHeight: '100vh', position: 'relative', backgroundColor: '#e6f7ff', padding: '24px' }}>
      <div
        style={{
          position: 'fixed',
          top: '50%',
          left: 0,
          transform: 'translateY(-50%)',
          zIndex: 1000,
          backgroundColor: '#fff',
          width: 32,
          height: 48,
          borderRadius: '0 8px 8px 0',
          boxShadow: '0 0 6px rgba(0,0,0,0.1)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          cursor: 'pointer',
          fontSize: 20,
          lineHeight: 1
        }}
        onClick={() => setCollapsed(!collapsed)}
      >
        {collapsed ? '>' : '<'}
      </div>
      <Layout style={{ background: 'transparent' }}>
        <Sider
          width={300}
          collapsedWidth={0}
          collapsed={collapsed}
          trigger={null}
          style={{ background: 'transparent', overflow: 'hidden' }}
        >
          {!collapsed && (
            <div style={{ padding: '24px 16px' }}>
              <div style={{ backgroundColor: 'white', padding: 24, borderRadius: 8 }}>
                <div style={{ fontWeight: 'bold', fontSize: '16px', marginBottom: '16px' }}>
                  溫室氣體試算
                </div>
                <Form
                  layout="vertical"
                  form={form}
                  onFinish={handleFormSubmit}
                  initialValues={{ isBiomass: '否' }}
                >
                  <Form.Item
                    label="溫室氣體排放來源"
                    name="source"
                    rules={[{ required: true, message: '請選擇排放來源' }]}
                  >
                    <Select
                      placeholder="請選擇"
                      options={Object.keys(rawMaterialData).map(key => ({
                        label: key,
                        value: key,
                      }))}
                      onChange={(value) => {
                        const isMobileFuel = mobileFuelCodes.includes(value);
                        setShowMobileSource(isMobileFuel);
                        form.setFieldsValue({ isMobileSource: isMobileFuel ? '否' : undefined });
                        setSource(value);
                        setScope(scopeMap[value]);
                        const defaultMaterial = rawMaterialData[value]?.[0]?.value || undefined;
                        form.setFieldsValue({
                          materialCode: defaultMaterial,
                          scope: scopeMap[value],
                        });
                      }}
                    />
                  </Form.Item>

                  <Form.Item
                    label="原燃物料代碼"
                    name="materialCode"
                    rules={[{ required: true, message: '請選擇原燃物料代碼' }]}
                  >
                    <Select
                      placeholder="請先選擇排放來源"
                      disabled={!source}
                      options={source ? rawMaterialData[source] : []}
                      onChange={(value) => {
                        const isMobileFuel = mobileFuelCodes.includes(value);
                        setShowMobileSource(isMobileFuel);
                        form.setFieldsValue({ isMobileSource: isMobileFuel ? '否' : undefined });
                      }}
                    />
                  </Form.Item>


                  <Form.Item
                    label="範疇別"
                    name="scope"
                    rules={[{ required: true, message: '請選擇範疇別' }]}
                  >
                    <Input readOnly style={{ backgroundColor: 'white', color: 'black' }} />
                  </Form.Item>

                  <Form.Item
                    label="活動數據"
                    name="activityData"
                    rules={[{ required: true, message: '請輸入活動數據' }]}
                  >
                    <Input type="number" placeholder="請輸入數值" step="0.0001" min="0" />
                  </Form.Item>

                  <div style={{
                    textAlign: 'center',
                    fontSize: '12px',
                    color: '#888',
                    marginTop: '-16px',
                    marginBottom: '12px',
                  }}>
                    單位：公噸/年；小數4位數為限
                  </div>

                  {showMobileSource && (
                    <Form.Item
                      label="是否為移動燃燒源"
                      name="isMobileSource"
                      rules={[{ required: true, message: '請選擇是否為移動燃燒源' }]}
                    >
                      <Radio.Group>
                        <Radio value="否">否</Radio>
                        <Radio value="是">是</Radio>
                      </Radio.Group>
                    </Form.Item>
                  )}

                  <Form.Item
                    label="是否屬於生質能"
                    name="isBiomass"
                    rules={[{ required: true, message: '請選擇是否為生質能' }]}
                  >
                    <Radio.Group>
                      <Radio value="否">否</Radio>
                      <Radio value="是">是</Radio>
                    </Radio.Group>
                  </Form.Item>

                  <Button type="primary" htmlType="submit">確認送出</Button>
                </Form>
              </div>
            </div>
          )}
        </Sider>


        {/* 右邊主內容區 */}
                <Content style={{ padding: 24, backgroundColor: '#E0F0FA', minHeight: 'calc(100vh - 64px)' }}>
          <Steps current={Math.min(current, 2)} items={steps} style={{ marginBottom: 24 }} />

          <h2 style={{ fontWeight: 'bold', fontSize: 24 }}>{current === 3 ? '結果分析' : '試算結果'}</h2>

          {current === 1 && results && results.rowData && (
            <div style={{ background: 'white', padding: 24, borderRadius: 8 }}>
              <Table
                className="custom-header-table"
                pagination={false}
                dataSource={[results.rowData]}
                columns={[
                  { title: '範疇別', dataIndex: 'scope', align: 'center' },
                  { title: '排放型式', dataIndex: 'type', align: 'center' },
                  { title: '原物料代碼', dataIndex: 'code', align: 'center' },
                  { title: '原燃物料名稱', dataIndex: 'name', align: 'center' },
                  { title: '活動數據', dataIndex: 'activityData', align: 'center' },
                  { title: '活動數據單位', dataIndex: 'unit', align: 'center' }
                ]}                
              />

              <hr style={{ margin: '32px 0', borderTop: '2px solid #bbb' }} />
              
              <Table
                pagination={false}
                dataSource={results.details}
                scroll={{ x: 'max-content' }}
                columns={[
                  {
                    title: '溫室氣體',
                    dataIndex: 'ghg',
                    render: (ghg) => gasNameMap[ghg] || ghg
                  },
                  {
                    title: '排放係數類型',
                    dataIndex: 'factorType',
                    render: (value, record, index) => (
                      <Select
                        defaultValue={value}
                        style={{ width: 100 }}
                        onChange={(newValue) => {
                          const newDetails = [...results.details];
                          newDetails[index].factorType = newValue;
                          setResults({ ...results, details: newDetails });
                        }}
                        options={[
                          { label: '預設', value: '預設' },
                          { label: '自訂', value: '自訂' }
                        ]}
                      />
                    )
                  },
                  { title: '排放係數值', dataIndex: 'factor' },
                  { title: '單位', dataIndex: 'unit' },
                  { title: '來源', dataIndex: 'source' },
                  { title: '排放量 (公噸/年)', dataIndex: 'emission' },
                  { title: 'GWP', dataIndex: 'gwp' },
                  { title: '排放當量 (公噸CO₂e/年)', dataIndex: 'emissionCO2e' },
                ]}
              />

              <div style={{ textAlign: 'right', marginTop: 24 }}>
                <Button type="primary" onClick={next}>下一步</Button>
              </div>
            </div>
          )}
          
          {/* 試算結果與統計分析 */}
{current === 2 && results && (
  <div style={{ background: 'white', padding: 24, borderRadius: 8 }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <h3 style={{ margin: 0 }}>總排放來源</h3>
      <Button type="primary" onClick={exportToCSV}>匯出CSV</Button>
    </div>
    <p></p>
    <Table
      className="custom-header-table"
      pagination={false}
      scroll={{ x: 'max-content' }}
      dataSource={rows}
      columns={[
        { title: '序號', dataIndex: 'serial' },
        { title: '範疇別', dataIndex: 'scope' },
        { title: '排放型式', dataIndex: 'type' },
        { title: '原物料代碼', dataIndex: 'code' },
        { title: '原燃物料名稱', dataIndex: 'name' },
        { title: '產生CO₂', dataIndex: 'co2' },
        { title: '產生CH₄', dataIndex: 'ch4' },
        { title: '產生N₂O', dataIndex: 'n2o' },
        { title: '產生HFCs', dataIndex: 'hfcs' },
        { title: '產生PFCs', dataIndex: 'pfcs' },
        { title: '產生SF₆', dataIndex: 'sf6' },
        { title: '產生NF₃', dataIndex: 'nf3' },
        { title: '活動數據（小數4位）', dataIndex: 'activityData' },
        {
          title: '活動數據單位',
          dataIndex: 'unit',
          render: (_, row) => row.type === '電力' ? '千度/年' : '公噸/年'
        },
        { title: '屬生質能源', dataIndex: 'isBiomass' },
        {
          title: '排放當量（公噸CO₂e/年）不含生質（小數4位）',
          dataIndex: 'emissionCO2e',
          render: (value) => formatNumber(value),
        },
        {
          title: '生質排放當量（公噸CO₂e/年）',
          dataIndex: 'biomassEmission',
          render: (value) => formatNumber(value),
        },
        {
          title: '操作',
          dataIndex: 'operation',
          align: 'center',
          render: (_, record) => (
            <Button danger onClick={() => handleDelete(record.key)}>刪除</Button>
          )
        }
      ]}
    />

    {/* 總排放當量彙總區塊 */}
    <div style={{ textAlign: 'right', marginTop: 12, fontWeight: 'bold' }}>
      總排放當量彙總(公噸CO₂e/年)：{formatNumber(rows.reduce((sum, row) => sum + parseFloat(row.emissionCO2e || 0), 0))}
    </div>

    {/* 動態分類加總直接排放型式 */}
    {(() => {
      const totalByType = {
        固定燃料燃燒: 0,
        製程: 0,
        移動: 0,
        逸散: 0,
      };

      rows.forEach(row => {
        const type = row.type;
        const value = parseFloat(row.emissionCO2e || 0);
        if (type === '燃料燃燒') totalByType['固定燃料燃燒'] += value;
        else if (type === '製程') totalByType['製程'] += value;
        else if (type === '移動') totalByType['移動'] += value;
        else if (type === '逸散') totalByType['逸散'] += value;
      });

      const subtotal = Object.values(totalByType).reduce((a, b) => a + b, 0);

      return (
        <>
          <h3 style={{ marginTop: 32 }}>排放量統計分析</h3>
          <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap', justifyContent: 'center' }}>
            <div style={{
              flex: 1,
              height: 320,
              border: '1px solid #ccc',
              padding: 16,
              borderRadius: 8,
              boxSizing: 'border-box',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}>
              <h4>總排放當量彙整(公噸CO₂e/年)</h4>
              <div style={{ position: 'relative' }}>
                <PieChart width={240} height={200}>
                  <Pie
                    data={pieData}
                    cx="45%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={70}
                    fill="#8884d8"
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                  <Legend
                    layout="vertical"
                    verticalAlign="middle"
                    align="right"
                    wrapperStyle={{ marginLeft: 12, paddingRight: 0 }}
                  />
                </PieChart>
                <p style={{ fontSize: 20, textAlign: 'center', margin: 0 }}>
                  {formatNumber(subtotal)} 公噸CO₂e
                </p>
              </div>
            </div>

            <div style={{ flex: 1, border: '1px solid #ccc', padding: 16, borderRadius: 8 }}>
              <h4>直接排放當量(公噸CO₂e/年)</h4>
              <table style={{ width: '100%', marginTop: 12, lineHeight: '2' }}>
                <tbody>
                  <tr>
                    <td>固定燃料燃燒</td>
                    <td style={{ textAlign: 'right' }}>{formatNumber(totalByType['固定燃料燃燒'])}</td>
                  </tr>
                  <tr>
                    <td>製程</td>
                    <td style={{ textAlign: 'right' }}>{formatNumber(totalByType['製程'])}</td>
                  </tr>
                  <tr>
                    <td>移動</td>
                    <td style={{ textAlign: 'right' }}>{formatNumber(totalByType['移動'])}</td>
                  </tr>
                  <tr>
                    <td>逸散</td>
                    <td style={{ textAlign: 'right' }}>{formatNumber(totalByType['逸散'])}</td>
                  </tr>
                  <tr style={{ fontWeight: 'bold', borderTop: '1px solid #999', marginTop: 8 }}>
                    <td>小計</td>
                    <td style={{ textAlign: 'right' }}>{formatNumber(subtotal)}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div style={{ flex: 1, border: '1px solid #ccc', padding: 16, borderRadius: 8 }}>
              <h4>能源間接排放當量(公噸CO₂e/年)</h4>
              <table style={{ width: '100%', marginTop: 12, lineHeight: '2' }}>
                <tbody>
                  <tr>
                    <td>外購電力</td>
                    <td style={{ textAlign: 'right' }}>
                      {formatNumber(
                        rows
                          .filter(row => row.code === '350099')
                          .reduce((sum, row) => sum + parseFloat(row.emissionCO2e || 0), 0)
                      )}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </>
      );
    })()}

    <div style={{ textAlign: 'right', marginTop: 24 }}>
      <Button type="primary" onClick={() => setCurrent(3)}>下一步</Button>
    </div>
  </div>
)}



          {current === 3 && (
            <Content style={{ padding: 5 }}>
              <div style={{ background: 'white', borderRadius: 12, padding: 24, marginTop: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16 }}>
                  <Button type="primary" onClick={exportToCSV}>匯出CSV</Button>
                </div>

                <div style={{ fontSize: 16, lineHeight: 2 }}>
                  <p style={{ fontWeight: 'bold' }}>系統分析建議如下：</p>
                </div>

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, marginTop: 12 }}>
                  {['能源替代', '提升能源效率', '減碳技術導入', '營運與流程優化'].map(title => {
                    const regex = new RegExp(`(?:${title}：|- ${title}：)([\\s\\S]*?)(?=\\n\\d+\\.|\\n?$)`, 'g');
                    const match = regex.exec(suggestionText);
                    const content = match ? match[1].trim().replace(/^[-:\s]+/, '') : '';

                    return (
                      <Card
                        key={title}
                        title={title}
                        bordered={true}
                        style={{ width: 'calc(50% - 8px)', backgroundColor: '#f0f9ff', borderColor: '#bae6fd' }}
                      >
                        <div style={{ whiteSpace: 'pre-wrap', fontSize: 15 }}>{content}</div>
                      </Card>
                    );
                  })}
                </div>


                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 24 }}>
                  <Button onClick={() => setCurrent(2)}>上一頁</Button>
                </div>
              </div>
            </Content>
          )}



        </Content>
      </Layout>
      <style>
      {`
        .custom-header-table .ant-table-thead > tr > th {
          background-color: #dbeafe !important;
          font-weight: bold !important;
          text-align: center;
        }
      `}
      </style>
    </Layout>
  );
};

export default App;
