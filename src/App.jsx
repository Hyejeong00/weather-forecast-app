import { useEffect, useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import styled, { createGlobalStyle } from 'styled-components'
import axios from "axios"

const GlobalStyle = createGlobalStyle`
  body {
      margin: 0;
      padding: 0;
      
      &::-webkit-scrollbar {
        display: none;            /* Chrome, Safari, Opera */
      }
    }
`

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  background-color: #f4f4f2; // 뮤트 베이지톤
  min-height: 100vh;
  padding: 40px 20px;
  color: #333;
  font-family: 'Noto Sans KR', sans-serif;
`

const CardContainer = styled.div`
  width: 800px;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 16px;
  margin-top: 20px;
`
const Card = styled.div`
background-color: #dce0d9;
  border-radius: 10px;
  padding: 16px;
  text-align: center;
  box-shadow: 0px 4px 8px rgba(0,0,0,0.1);
  transition: transform 0.2s ease-in-out;

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0px 8px 12px rgba(0,0,0,0.1);
  }
`

const DateAndIcon = styled.div`
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
`

const Icon = styled.img`
  width: 50px;
  height: 50px;
`

function App() {
  const [location, setLocation] = useState({ lat: null, lon: null });
  const [weatherData, setWeatherData] = useState(null)
  const [error, setError] = useState(null)
  const KEY = "6e2995a590094d98849ff33112981f3f"

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
      setLocation({
        lat: position.coords.latitude,
        lon: position.coords.longitude,
      });
      },
      (error) => {
        console.log("위치 정보 불러오기에 실패했습니다:", error)
        setError(error.message);
      }
    );
    }, []);

  useEffect(() => {
    if(!location) return

    const fetchWeatherData = async () => {
      try{
        const {lat , lon} = location
        const res = await axios.get(`https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${KEY}&units=metric`);

        const data = res.data
        const weatherList = {}

        data.list.forEach((el) => {
          const date = new Date(el.dt * 1000).toLocaleDateString("ko-KR")
          if(!weatherList[date] || el.dt_txt.includes("12:00:00")){
            weatherList[date] = {
              temp: el.main.temp,
              weather: el.weather[0].description,
              icon: el.weather[0].icon,
            }
          }
        })

        setWeatherData({
          city: data.city.name,
          forecast: Object.entries(weatherList).slice(0, 5),
        })
      }catch(error){
        console.log("날씨 정보 불러오기에 실패했습니다: ", error)
      }
    }

    if (location.lat && location.lon) {
      fetchWeatherData(location.latitude, location.longitude);
    }
  }, [location, KEY])

  return (
    <>
      <GlobalStyle/>
      <Container>
        {weatherData ? (
          <>
            <h1>{weatherData.city} - 5Days Weather</h1>
            <Location location={location} error={error}/>
            <CardContainer>
              {
                weatherData.forecast.map(([date, info], index) => (
                  <Card key={index}>
                    <DateAndIcon>
                      <p>{date}</p>
                      <Icon src={`https://openweathermap.org/img/wn/${info.icon}.png`}/>
                    </DateAndIcon>
                    <p>{info.weather}</p>
                    <p>🌡 {info.temp}°C</p>
                  </Card>
                ))
              }
            </CardContainer>
          </>
        ): (<div>날씨 정보를 불러오는 중...</div>)}
      </Container>
    </>
  )
}

const Location = ({location , error}) => {
  return (
    <div>
      <h2>📍 내 위치 정보</h2>
      {error ? (
        <p style={{ color: "red" }}>오류: {error}</p>
      ) : (
        <p>
          위도: {location.lat.toFixed(2)} <br />
          경도: {location.lon.toFixed(2)}
        </p>
      )}
    </div>
  );
}

export default App
