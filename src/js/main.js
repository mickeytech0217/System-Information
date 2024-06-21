document.addEventListener("DOMContentLoaded", function () {
  const terminal = document.getElementById("terminal");

  // Create a new command element with input field
  const createCommandElement = () => {
    const commandInput = document.createElement("div");
    commandInput.innerHTML = `
        <div class="flex text-sm md:text-base gap-2 my-2">
        <span class="text-red-500"
          >sysinfo:~<span class="text-green-500">$</span></span
        >
        <input
          type="text"
          id="command"
          class="bg-transparent text-slate-50 outline-none border-none w-full"
          autocomplete="false"
          aria-label="command"
        />
        </div>`;
    terminal.appendChild(commandInput);

    // Focus on the input field
    const inputField = commandInput.querySelector("#command");
    inputField.focus();
    inputField.addEventListener("keydown", handleCommand);
  };

  // Battery command handler
  const batteryHandler = async (outElement) => {
    navigator.getBattery().then((battery) => {
      outElement.textContent = `=#= Battery Stats =#=\n\n`; // Clear the output element
      outElement.textContent += `Battery Level: ${
        battery.level > 0.5 ? "🔋 " : "🪫 "
      }${battery.level * 100}% ${
        battery.level <= 0.2 ? "(Low battery)" : ""
      }\n`;
      outElement.textContent += `Battery Status: ${
        battery.charging ? "⚡ Charging" : "🔌 Not Charging"
      }\n`;
      outElement.textContent += `Battery Charging Time: ${
        battery.chargingTime !== Infinity
          ? `${battery.chargingTime} seconds`
          : "😢 Couldn't calculate"
      }\n`;
      outElement.textContent += `Battery Discharging Time: ${
        battery.chargingTime !== Infinity
          ? `${battery.chargingTime} seconds`
          : "😢 Couldn't calculate"
      }\n`;
    });
  };

  // Network command handler
  const networkHandler = async (outElement) => {
    const connection =
      (await navigator.connection) ||
      (await navigator.mozConnection) ||
      (await navigator.webkitConnection);

    outElement.textContent = `=#= Network Stats =#=\n\n`; // Clear the output element
    outElement.textContent += `Connection Type: ${connection.effectiveType}\n`;
    outElement.textContent += `Effective Bandwidth: ${connection.downlink} Mbps\n`;
    outElement.textContent += `Data Saver: ${
      connection.saveData ? "Active" : "Inactive"
    }\n`;
    outElement.textContent += `Round-trip Time: ${connection.rtt} ms\n`;
  };

  // Weather command handler
  const weatherHandler = async (props) => {
    const location = await props.location;
    const outElement = await props.outputElement;
    // get location from input command
    const url = `https://rapidweather.p.rapidapi.com/data/2.5/weather?q=${location}&metric=true&units=imperial&lang=en`;
    const options = {
      method: "GET",
      headers: {
        "X-RapidAPI-Key": "135d822d36mshb2297f486170e36p1233a7jsne715a69bf7ac",
        "X-RapidAPI-Host": "rapidweather.p.rapidapi.com",
      },
    };

    // get weather icon
    const getWeatherIcon = (weather) => {
      switch (weather) {
        case "Clear":
          return "☀️";
        case "Clouds":
          return "☁️";
        case "Rain":
          return "🌧️";
        case "Snow":
          return "❄️";
        case "Mist":
          return "🌫️";
        case "Thunderstorm":
          return "⛈️";
        case "Drizzle":
          return "🌦️";
        case "Haze":
          return "🌫️";
        case "Fog":
          return "🌫️";
        case "Smoke":
          return "🌫️";
        case "Sand":
          return "🌫️";
        case "Dust":
          return "🌫️";
        case "Ash":
          return "🌫️";
        case "Squall":
          return "🌫️";
        case "Tornado":
          return "🌪️";
        default:
          return "🌫️";
      }
    };

    // fahrenheit to celsius
    const fahrenheitToCelsius = (fahrenheit) => {
      return Math.round(((fahrenheit - 32) * 5) / 9);
    };

    try {
      const response = await fetch(url, options);
      const result = await response.json();
      console.log(result);
      outElement.textContent = `=#= Weather Stats (${result.name}) =#=\n\n`; // Clear the output element
      outElement.textContent += `Current Weather: ${
        result.weather[0].main
      } ${getWeatherIcon(result.weather[0].main)}\n`;
      outElement.textContent += `Temperature: ${fahrenheitToCelsius(
        result.main.temp
      )}°C/${Math.round(result.main.temp)}°F\n`;
      outElement.textContent += `Feels Like: ${fahrenheitToCelsius(
        result.main.feels_like
      )}°C/${Math.round(result.main.feels_like)}°F\n`;
      outElement.textContent += `Min Temperature: ${fahrenheitToCelsius(
        result.main.temp_min
      )}°C/${Math.round(result.main.temp_min)}°F\n`;
      outElement.textContent += `Max Temperature: ${fahrenheitToCelsius(
        result.main.temp_max
      )}°C/${Math.round(result.main.temp_max)}°F\n`;
      outElement.textContent += `Pressure: ${result.main.pressure} hPa\n`;
      outElement.textContent += `Humidity: ${result.main.humidity} %\n`;
      outElement.textContent += `Visibility: ${result.visibility} m\n`;
      outElement.textContent += `Wind Speed: ${result.wind.speed} m/s\n`;
      outElement.textContent += `Wind Direction: ${result.wind.deg}°\n`;
    } catch (error) {
      outElement.textContent = "❌ Couldn't fetch weather information\n";
      console.error(error);
    }
  };

  const getDomainInfo = async (props) => {
    const domain = await props.domain;
    const outElement = await props.outputElement;
  };

  // get DNS records of a domain
  const domainDNSHandler = async (props) => {
    const domain = await props.domain;
    const outElement = await props.outputElement;
    // get DNS info
    const url = `https://dns.google/resolve?name=${domain}&type=A`;
    const options = {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
    };

    // get all DNS records
    const getDNSRecords = (data) => {
      const records = [];
      data.forEach((element) => {
        records.push(element.data);
      });
      return records;
    };

    try {
      const response = await fetch(url, options);
      const result = await response.json();
      console.log(result);
      // dns record
      outElement.textContent = `=#= DNS Record Stats (${domain}) =#=\n\n`;

      const answer =
        result.Answer && result.Answer.length > 0 ? result.Answer[0] : null;
      const authority =
        result.Authority && result.Authority.length > 0
          ? result.Authority[0]
          : null;

      outElement.textContent += `DNS Type: ${
        answer ? answer.type : authority ? authority.type : "N/A"
      }\n`;
      outElement.textContent += `DNS TTL: ${
        answer ? answer.TTL : authority ? authority.TTL : "N/A"
      }\n`;
      outElement.textContent += `DNS Records: ${
        answer
          ? getDNSRecords(result.Answer).join(", ")
          : authority
          ? getDNSRecords(result.Authority).join(", ")
          : "N/A"
      }\n`;
    } catch (error) {
      outElement.textContent = "❌ Couldn't fetch domain information\n";
      console.error(error);
    }
  };

  // Handle command input
  const handleCommand = (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      const commandInput = event.target;

      // Remove the input field and replace with span for preventing further input
      const commandSpan = document.createElement("span");
      commandSpan.className = "text-slate-50 text-sm md:text-base";
      commandSpan.textContent = commandInput.value;
      commandInput.replaceWith(commandSpan);

      const userInput = commandInput.value.trim().toLowerCase();
      const command = userInput.split(" ")[0];

      // Create a new output element
      const outputElement = document.createElement("span");
      outputElement.className =
        "text-slate-50 text-sm md:text-base whitespace-break-spaces";
      terminal.appendChild(outputElement);

      // Handle different commands and update outputElement accordingly
      switch (command) {
        case "": // Empty command input
          createCommandElement();
          break;
        case "help":
          outputElement.textContent += "Available commands:\n";
          outputElement.textContent +=
            "- sysinfo: Displays system information\n";
          outputElement.textContent +=
            "- battery: Displays battery information\n";
          outputElement.textContent +=
            "- network: Displays network information\n";
          // weather
          outputElement.textContent +=
            "- weather <location>: Displays weather information\n";
          // domain
          outputElement.textContent +=
            "- dns <domain>: Displays DNS information\n";
          outputElement.textContent += "- clear: Clears the terminal\n";

          createCommandElement(); // Re-render the terminal
          break;
        case "sysinfo":
          outputElement.textContent += "Fetching system information...\n";
          // Get and display system information here
          createCommandElement();
          break;

        case "battery":
          outputElement.textContent += "Fetching battery information...\n";
          // Get and display battery information here
          setTimeout(async () => {
            await batteryHandler(outputElement);
            createCommandElement();
          }, 500);
          break;

        case "network":
          outputElement.textContent += "Fetching network information...\n";
          // Get and display network information here
          setTimeout(async () => {
            await networkHandler(outputElement);
            createCommandElement();
          }, 500);
          break;

        // this case can be dynamic and catch all the commands that start with weather and command can be (weather london or weather sri lanka or like that)
        case "weather":
          outputElement.textContent += "Fetching weather information...\n";
          // Get and display weather information here
          setTimeout(async () => {
            // take location as rest after weather
            const location = userInput.split(" ").slice(1).join(" ");
            await weatherHandler({
              location: location,
              outputElement: outputElement,
            });
            createCommandElement();
          }, 500);
          break;

        // domain info lookup
        case "domain":
          outputElement.textContent += "Fetching domain information...\n";
          // Get and display domain information here
          setTimeout(async () => {
            // take domain as rest after command
            const domain = userInput.split(" ").slice(1).join(" ");
            await getDomainInfo({
              domain: domain,
              outputElement: outputElement,
            });
            createCommandElement();
          }, 500);
          break;

        // dns lookup
        case "dns":
          outputElement.textContent += "Fetching DNS information...\n";
          // Get and display dns information here
          setTimeout(async () => {
            // take domain as rest after command
            const domain = userInput.split(" ").slice(1).join(" ");
            await domainDNSHandler({
              domain: domain,
              outputElement: outputElement,
            });
            createCommandElement();
          }, 500);
          break;

        case "clear":
          // Remove the previous input and output
          while (terminal.firstChild) {
            terminal.removeChild(terminal.firstChild);
          }
          createCommandElement(); // Re-render the terminal
          break;

        default:
          outputElement.className =
            "text-red-500 mt-2 text-sm md:text-base whitespace-break-spaces";
          outputElement.textContent +=
            "❌ Unknown command. Type 'help' for assistance.\n";
          createCommandElement(); // Re-render the terminal
          break;
      }
    }
  };

  // Initial terminal rendering
  createCommandElement();
});
