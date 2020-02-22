const AWS = require('aws-sdk');
const sharp = require("sharp");

const s3 = new AWS.S3();

// handler가 Lambda 호출 시 실행되는 함수
// event : 호출 상황에 대한 정보
// context : 실행되는 함수 환경에 대한 정보
// callback : 함수가 완료되었는지 람다에 알려줌
// callback의 첫번째인자 : 에러 여부, 두번째인자 : 설명을 의미
exports.handler = async (event, context, callback) => {

    const Bucket = event.Records[0].s3.bucket.name; // 버킷이름
    const Key = event.Records[0].s3.object.key; // 파일경로
    const filename = Key.split('/')[Key.split('/').length - 1];
    const ext = Key.split('.')[Key.split('.').length - 1]; // 확장자
 
  try {
    console.log('Key', Key, filename, ext);

    // getObject로 버킷으로 부터 파일을 불러옴
    // data.body에 파일 버퍼가 담겨있음
    const image = await s3.getObject({ Bucket, Key }).promise();

    console.log('getObj', image);
    // 파일버퍼를 넣고, 크기지정
    const resizedImg = await sharp(image.Body)
        .resize({ width: 800 })
        .toBuffer();
    return await s3
        .putObject({
        Bucket,
        Key: `thumb/${filename}`,
        Body: resizedImg,
        })
        .promise();

    callback(null, `Success: ${filename}`);
  } catch (err) {
    callback(`Error resizing files: ${err}`);
  }
};