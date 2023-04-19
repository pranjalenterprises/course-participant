const generatePDF = async (link)=>{

    const url = new URL(link);
    // const namepart = url.pathname.split("/"); // split the path into parts using the forward slash as the delimiter
    // const name = decodeURI(namepart[4]); // get the 3rd part (index 2) which contains the name

    const idpart = url.pathname.split("/"); // split the path into parts using the forward slash as the delimiter
    const id = decodeURI(idpart[3]); // get the 3rd part (index 2) which contains the name

        
    // Define the URL of the CSV file
    const datacsv = '../../../data.csv';

    // Define the ID to search for
    const searchId = id;

    // Declare a variable to store the name
    let name = '';

    // Use Papa.parse() to parse the CSV file
    Papa.parse(datacsv, {
    download: true,
    header: true,
    complete: function(results) {
        // Access the data from the CSV file
        const data = results.data;
        
        // Iterate over the data to find the row with the matching ID
        let match = null;
        data.forEach(function(row) {
        if (row['id'] === searchId) {
            match = row;
        }
        });
        
        // If a match was found, retrieve the name
        if (match !== null) {
        name = match['Name'];
        } else {
        // Handle the case where no match was found
        console.log('ID not found');
        }
    }
    });


    const now = new Date();
    const date = now.toISOString().slice(0, 10);
    const time = now.toISOString().slice(11, 16);

    const currentDateTime = `Training certificate generated on ${date} ${time} UTC +00:00`;


    const { PDFDocument, rgb } = PDFLib;

    const exBytes = await fetch("../../../cert22.pdf").then((res) => {
        return res.arrayBuffer();
    });

    const exFont = await fetch("../../../ARIAL.TTF").then((res) =>{
        return res.arrayBuffer();
    })

    const pdfDoc = await PDFDocument.load(exBytes);

    pdfDoc.registerFontkit(fontkit);

    const myFont = await pdfDoc.embedFont(exFont);

    const pages = pdfDoc.getPages();
    const firstpg = pages[0];

    // Set the font and font size for the text
    const fontSize = 10;

    // Calculate the total width of the text
    const currentDateTimeWidth = myFont.widthOfTextAtSize(currentDateTime, fontSize);
    const idWidth = myFont.widthOfTextAtSize(id, fontSize);
    const nameWidth = myFont.widthOfTextAtSize(name, fontSize);

    // Calculate the width of a single space character
    const spaceWidth = myFont.widthOfTextAtSize(' ', fontSize);

    // Calculate the spacing to use between each character
    const currentDateTimeSpacing = (99 - currentDateTimeWidth) / (currentDateTime.length - 1);
    const idSpacing = (30 - idWidth) / (id.length - 1);
    const nameSpacing = (22 - nameWidth) / (name.length - 1);

    // Draw each character separately, with a small amount of space between them
    let x = 164;
    for (let i = 0; i < currentDateTime.length; i++) {
    const char = currentDateTime.charAt(i);
    firstpg.drawText(char, {
        x,
        y: 575,
        size: fontSize,
        myFont,
    });
    x += myFont.widthOfTextAtSize(char, fontSize) + currentDateTimeSpacing + spaceWidth;
    }

    x = 270.5;
    for (let i = 0; i < id.length; i++) {
    const char = id.charAt(i);
    firstpg.drawText(char, {
        x,
        y: 638,
        size: fontSize,
        myFont,
    });
    x += myFont.widthOfTextAtSize(char, fontSize) + idSpacing + spaceWidth;
    }

    // Calculate the total width of the text
    const textWidth2 = myFont.widthOfTextAtSize(name, fontSize);

    // Get the width of the page
    const pageWidth = firstpg.getSize().width;

    // Calculate the x coordinate for centered text
    const x2 = (pageWidth - textWidth2) / 2;

    // Draw the text centered
    firstpg.drawText(name, {
    x: x2,
    y: 605,
    size: fontSize,
    });





    // Define the text to draw
    const text = link;

    // Calculate the total width of the text
    const textWidth = myFont.widthOfTextAtSize(text, fontSize);

    // Calculate the width of a single space character
    const spaceWidth1 = myFont.widthOfTextAtSize(' ', fontSize);

    // Calculate the spacing to use between each character
    const spacing = (94 - textWidth) / (text.length - 1);

    // Draw each character separately, with a small amount of space between them
    x = 95;
    for (let i = 0; i < text.length; i++) {
    const char = text.charAt(i);
    firstpg.drawText(char, {
        x,
        y: 330,
        size: fontSize,
        myFont,
        color: rgb(0, 0, 1),
        link: link,
    });
    
    x += myFont.widthOfTextAtSize(char, fontSize) + spacing + spaceWidth1;
    }

    

    // Split the URL into segments using the '/' delimiter
    const segments = link.split('/');

    // Get the last segment of the URL using the pop method
    const lastSegment = segments.pop();

    // Calculate the total width of the last segment
    const lastSegmentWidth = myFont.widthOfTextAtSize(lastSegment, fontSize);

    // Calculate the spacing to use between each character for the last segment
    const lastSegmentSpacing = (140 - lastSegmentWidth) / (lastSegment.length - 1);

    // Draw each character of the last segment separately, with a small amount of space between them
    x = 97;
    for (let i = 0; i < lastSegment.length; i++) {
        const char = lastSegment.charAt(i);
        firstpg.drawText(char, {
            x,
            y: 339,
            size: fontSize,
            myFont,
            charSpace: -1.5,
        });

        x += myFont.widthOfTextAtSize(char, fontSize) + lastSegmentSpacing + spaceWidth - myFont.widthOfTextAtSize(' ', fontSize);
    }


    const uri = await pdfDoc.saveAsBase64({dataUri: true})

    document.querySelector("#mypdf").src = uri;


    const pdfBytes = await pdfDoc.save(); // Step 1

    const blob = new Blob([pdfBytes], { type: 'application/pdf' }); // Step 2

    const url2 = URL.createObjectURL(blob); // Step 3

    const a = document.createElement('a'); // Step 4
    a.href = url2;
    a.download = 'certificate.pdf'; // Step 5

    a.click(); // Step 6

};

generatePDF(currentUrl);
