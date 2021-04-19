const express = require("express");
const app = express();
const logger = require("morgan");
const temp_data = require("./data.json");
const db = require("./models");

db.sequelize.authenticate().then(async () => {
  try {
    await db.sequelize.sync({ force: false });
    await db.Keywords.findOrCreate({
      where: {
        idx: 1,
      },
      defaults: {
        keywords: "",
      },
    });
  } catch (error) {}
});

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(logger("dev"));

//검색을 통해 관심 키워드 조사 , 실서비스에서는 동영상 클릭 기준, 쇼핑몰 즐겨찾기, 구매기준 등등으로 변경 해야함
//키워드는 배열로 관리하고, 최근 검색한 30개를 기준으로 알고리즘 판정
app.post("/search", async (req, res) => {
  try {
    let { keywords } = req.query;
    const base_keywords = await db.Keywords.findOne({
      where: {
        idx: 1,
      },
    });
    let base_arr = base_keywords.keywords.split(",");
    base_arr.push(keywords);
    base_arr = base_arr.filter((keywords) => {
      return keywords !== null && keywords !== undefined && keywords !== "";
    });
    if (base_arr.length > 30) {
      base_arr.shift();
    }
    const rows = await db.Keywords.update(
      {
        keywords: base_arr.toString(),
      },
      {
        where: {
          idx: 1,
        },
      }
    );
    if (rows) return res.status(200).json({ result: true });
  } catch (error) {}
});

app.get("/myalgorithm", async (req, res) => {
  try {
    const base_keywords = await db.Keywords.findOne({
      where: {
        idx: 1,
      },
    });
    let base_arr = base_keywords.keywords.split(",");
    let count = {};
    base_arr.forEach((k) => {
      count[k] = (count[k] || 0) + 1;
    });

    let compareCount = [];
    let compareKey = [];
    for (key in count) {
      compareKey.push(key);
      compareCount.push(count[key]);
    }

    let tempKey = "";
    let tempCount = 0;
    for (let i = 0; i < compareKey.length; i++) {
      if (compareCount[i] < compareCount[i + 1]) {
        tempKey = compareKey[i];
        tempCount = compareCount[i];
        compareKey[i] = compareKey[i + 1];
        compareCount[i] = compareCount[i + 1];
        compareKey[i + 1] = tempKey;
        compareCount[i + 1] = tempCount;
      }
    }

    let recommend = [];
    let k = 0;
    console.log(compareKey);
    while (k < compareKey.length) {
      for (let i = 0; i < temp_data.length; i++) {
        if (compareKey[k] === temp_data[i].genre) {
          recommend.push(temp_data[i]);
        }
      }
      k = k + 1;
    }

    //if you want to show 10 recommends results
    while (recommend.length > 10) {
      recommend.pop();
    }
    console.log(recommend.length);
    return res.status(200).json({ result: recommend });
  } catch (error) {
    console.log(error);
  }
});

app.listen(8081);
