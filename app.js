const express = require("express");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");

const databasePath = path.join(__dirname, "covid19India.db");

const app = express();
let database = null;

const initializeDbAndServer = async () => {
  try {
    database = await open({
      filename: databasePath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () =>
      console.log("server running at http://localhost:3000/")
    );
  } catch (error) {
    console.log(`DB Error: ${error.message}`);
    process.text(1);
  }
};
initializeDbAndServer();

const convertStateDbObjectResponseObject = (dbObject) => {
  return {
    stateId: dbObject.state_id,
    stateName: dbObject.state_name,
    Population: dbObject.population,
  };
};

const convertDistrictDbObjectResponseObject = (dbObject) => {
  return {
    districtId: dbObject.district_id,
    districtName: dbObject.district_name,
    stateId: dbObject.state_id,
    Cases: dbObject.cases,
    Cured: dbObject.cured,
    Active: dbObject.active,
    Deaths: dbObject.deaths,
  };
};
app.get("/states/", async (request, response) => {
  const getStatesQuery = `
    SELECT
      state_name
    FROM
      state;`;
  const StateArray = await database.all(getStateQuery);
  response.send(
    StateArray.map((eachState) => ({ stateName: eachState.state_name }))
  );
});
app.get("/states/:stateId/", async (request, response) => {
  const { stateId } = request.params;
  const getStateQuery = `
    select
    *
     from 
     state
     where
     state_id =${stateId}`;
  const state = await database.get(getStateQuery);
  response.send(convertStateDbObjectResponseObject(state));
});
app.post("/districts/", async (request, response) => {
  const { directorName, stateId, cases, cured, active, deaths } = request.body;
  const postDistrictQuery = `
  INSERT INTO
    district ( director_name,state_id,cases,cured,active,deaths)
  VALUES
    (${directorName}, '${stateId}', '${cases}','${cured}','${active}','${deaths}');`;
  await database.run(postDistrictQuery);
  response.send(" District Successfully Added");
});
app.get("/districts/:districtId/", async (request, response) => {
  const { districtId } = request.params;
  const getDistrictQuery = `
    select
    *
     from 
     district
     where
     district_id =${districtId}`;
  const District = await database.get(getDistrictQuery);
  response.send(convertStateDbObjectResponseObject(District));
});
app.delete("/districts/:districtId/", async (request, response) => {
  const { districtId } = request.params;
  const deleteMovieQuery = `
  DELETE FROM
    district
  WHERE
    district_id = ${districtId};`;
  await database.run(deleteMovieQuery);
  response.send("District Removed");
});
app.put("/districts/:districtId/", async (request, response) => {
  const { directorName, stateId, cases,cured,active,deaths } = request.body;
  const { districtId } = request.params;
  const updateDistrictQuery = `
            UPDATE
              district
            SET
              district_Name = ${directorName},
              state_id = '${stateId}',
              Cases = '${cases}',
              Cured ='${cured}',
              Active ='${active}',
              Deaths ='${deaths}',
            WHERE
              district_id = ${districtId};`;

  await database.run(updateDistrictQuery);
  response.send("District Details Updated");

  app.get("/states/:stateId/stats/", async (request, response) => {
  const { stateId } = request.params;
  const getStateDistrictQuery = `
    SELECT
    state_name
      
    FROM
      state
    WHERE
      state_id='${stateId}';`;
  const StateArray = await database.all(getStateDistrictQuery);
  response.send(
    State
    StateArray.map((eachMovie) => ({ stateName: eachMovie.state_name }))
  );
});
 app.get("/districts/:districtId/details/", async (request, response) => {
  const { districtId } = request.params;
  const getDistrictQuery = `
    SELECT
    district_name
      
    FROM
      district
    WHERE
      district_id='${districtId}';`;
  const DistrictArray = await database.all(getDistrictQuery);
  response.send(
    State
    DistrictArray.map((eachMovie) => ({ districtName: eachMovie.district_name }))
  );
});


module.exports =app;



